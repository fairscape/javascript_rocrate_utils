const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DEFAULT_CONTEXT = {
  "@vocab": "https://schema.org/",
  EVI: "https://w3id.org/EVI#",
};

const NAAN = "59852";

function generateDatetimeSquid() {
  return uuidv4().split("-")[0];
}

function generateROCrate({
  path: cratePath,
  guid,
  name,
  description,
  author,
  keywords,
  organizationName = null,
  projectName = null,
  packageType = null,
}) {
  if (!name) {
    throw new Error("Name is required for ROCrate generation");
  }

  if (!guid) {
    const sq = generateDatetimeSquid();
    guid = `ark:${NAAN}/rocrate-${name.toLowerCase().replace(" ", "-")}-${sq}`;
  }

  // Create the root dataset entity
  const rootDataset = {
    "@id": guid,
    "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"],
    name: name,
    keywords: keywords,
    description: description,
    author: author,
  };

  // Add packageType to the root dataset if provided
  if (packageType) {
    rootDataset.packageType = packageType;
  }

  // Create organization and project entities if needed
  const isPartOf = [];
  if (organizationName) {
    const organizationGuid = `ark:${NAAN}/organization-${organizationName
      .toLowerCase()
      .replace(" ", "-")}-${generateDatetimeSquid()}`;
    isPartOf.push({
      "@id": organizationGuid,
    });
  }

  if (projectName) {
    const projectGuid = `ark:${NAAN}/project-${projectName
      .toLowerCase()
      .replace(" ", "-")}-${generateDatetimeSquid()}`;
    isPartOf.push({
      "@id": projectGuid,
    });
  }

  if (isPartOf.length > 0) {
    rootDataset.isPartOf = isPartOf;
  }

  // Create the metadata descriptor
  const metadataDescriptor = {
    "@id": "ro-crate-metadata.json",
    "@type": "CreativeWork",
    conformsTo: { "@id": "https://w3id.org/ro/crate/1.2-DRAFT" },
    about: { "@id": guid },
  };

  // Create the full RO-Crate structure
  const roCrateInstanceMetadata = {
    "@context": DEFAULT_CONTEXT,
    "@graph": [metadataDescriptor, rootDataset],
    packageType: packageType,
  };

  let roCrateMetadataPath;
  if (cratePath.includes("ro-crate-metadata.json")) {
    roCrateMetadataPath = cratePath;
    fs.mkdirSync(path.dirname(roCrateMetadataPath), { recursive: true });
  } else {
    roCrateMetadataPath = path.join(cratePath, "ro-crate-metadata.json");
    fs.mkdirSync(cratePath, { recursive: true });
  }

  fs.writeFileSync(
    roCrateMetadataPath,
    JSON.stringify(roCrateInstanceMetadata, null, 2)
  );

  return roCrateInstanceMetadata;
}

class ROCrate {
  constructor(
    name,
    description,
    author,
    keywords,
    projectName = null,
    organizationName = null,
    path
  ) {
    this.guid = null;
    this.name = name;
    this.description = description;
    this.author = author;
    this.keywords = keywords;
    this.projectName = projectName;
    this.organizationName = organizationName;
    this.path = path;
  }

  generateGuid() {
    if (!this.guid) {
      const sq = generateDatetimeSquid();
      this.guid = `ark:${NAAN}/rocrate-${this.name
        .replace(" ", "-")
        .toLowerCase()}-${sq}`;
    }
    return this.guid;
  }

  createCrateFolder() {
    fs.mkdirSync(this.path, { recursive: true });
  }

  initCrate() {
    const roCrateMetadataPath = path.join(this.path, "ro-crate-metadata.json");
    this.generateGuid();

    // Create root dataset
    const rootDataset = {
      "@id": this.guid,
      "@type": ["Dataset", "https://w3id.org/EVI#ROCrate"],
      name: this.name,
      description: this.description,
      keywords: this.keywords,
    };

    // Add organization and project if specified
    const isPartOf = [];
    if (this.organizationName) {
      const organizationGuid = `ark:${NAAN}/organization-${this.organizationName
        .toLowerCase()
        .replace(" ", "-")}-${generateDatetimeSquid()}`;
      isPartOf.push({
        "@id": organizationGuid,
        "@type": "Organization",
        name: this.organizationName,
      });
    }

    if (this.projectName) {
      const projectGuid = `ark:${NAAN}/project-${this.projectName
        .toLowerCase()
        .replace(" ", "-")}-${generateDatetimeSquid()}`;
      isPartOf.push({
        "@id": projectGuid,
        "@type": "Project",
        name: this.projectName,
      });
    }

    if (isPartOf.length > 0) {
      rootDataset.isPartOf = isPartOf;
    }

    // Create metadata descriptor
    const metadataDescriptor = {
      "@id": "ro-crate-metadata.json",
      "@type": "CreativeWork",
      conformsTo: { "@id": "https://w3id.org/ro/crate/1.2-DRAFT" },
      about: { "@id": this.guid },
    };

    const roCrateMetadata = {
      "@context": DEFAULT_CONTEXT,
      "@graph": [metadataDescriptor, rootDataset],
      packageType: packageType,
    };

    fs.writeFileSync(
      roCrateMetadataPath,
      JSON.stringify(roCrateMetadata, null, 2)
    );
  }

  registerObject(model) {
    const metadataPath = path.join(this.path, "ro-crate-metadata.json");
    const roCrateMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

    // Add the new entity to the graph
    roCrateMetadata["@graph"].push(model);

    // Find the root dataset (second element in @graph after metadata descriptor)
    const rootDataset = roCrateMetadata["@graph"][1];

    // Initialize hasPart if it doesn't exist
    if (!rootDataset.hasPart) {
      rootDataset.hasPart = [];
    }

    // Add reference to the new entity
    rootDataset.hasPart.push({ "@id": model["@id"] });

    fs.writeFileSync(metadataPath, JSON.stringify(roCrateMetadata, null, 2));
  }

  registerDataset(dataset) {
    this.registerObject(dataset);
  }

  registerSoftware(software) {
    this.registerObject(software);
  }

  registerComputation(computation) {
    this.registerObject(computation);
  }

  listContents() {
    const metadataPath = path.join(this.path, "ro-crate-metadata.json");
    const roCrateMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

    // Skip the metadata descriptor (first element)
    return roCrateMetadata["@graph"].slice(1).map((element) => ({
      ro_crate: "*",
      id: element["@id"],
      type: Array.isArray(element["@type"])
        ? element["@type"].join(", ")
        : element["@type"],
      name: element.name,
    }));
  }
}

function readROCrateMetadata(cratePath) {
  const metadataCratePath = cratePath.includes("ro-crate-metadata.json")
    ? cratePath
    : path.join(cratePath, "ro-crate-metadata.json");

  return JSON.parse(fs.readFileSync(metadataCratePath, "utf8"));
}

function appendCrate(cratePath, elements) {
  if (fs.statSync(cratePath).isDirectory()) {
    cratePath = path.join(cratePath, "ro-crate-metadata.json");
  }

  if (elements.length === 0) {
    return null;
  }

  const roCrateMetadata = JSON.parse(fs.readFileSync(cratePath, "utf8"));

  // Find the root dataset (second element in @graph after metadata descriptor)
  const rootDataset = roCrateMetadata["@graph"][1];

  // Initialize hasPart if it doesn't exist
  if (!rootDataset.hasPart) {
    rootDataset.hasPart = [];
  }

  elements.forEach((element) => {
    // Add the element to the graph
    roCrateMetadata["@graph"].push(element);
    // Add reference to the element in root dataset's hasPart
    rootDataset.hasPart.push({ "@id": element["@id"] });
  });

  fs.writeFileSync(cratePath, JSON.stringify(roCrateMetadata, null, 2));
}

module.exports = {
  generateROCrate,
  ROCrate,
  readROCrateMetadata,
  appendCrate,
};
