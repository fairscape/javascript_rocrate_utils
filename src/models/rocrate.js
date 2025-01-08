const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const DEFAULT_CONTEXT = {
  "@vocab": "https://schema.org/",
  sh: "http://www.w3.org/ns/shacl#",
  EVI: "https://w3id.org/EVI#",
};

const NAAN = "99999"; // Replace with your actual NAAN

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
  packageType = null, // Add packageType parameter
}) {
  console.log("projectName in models: ", projectName);
  if (!name) {
    throw new Error("Name is required for ROCrate generation");
  }

  if (!guid) {
    const sq = generateDatetimeSquid();
    guid = `ark:${NAAN}/rocrate-${name.toLowerCase().replace(" ", "-")}-${sq}`;
  }

  let roCrateInstanceMetadata = {
    "@id": guid,
    "@context": {
      "@vocab": "https://schema.org/",
      EVI: "https://w3id.org/EVI#",
    },
    "@type": "https://w3id.org/EVI#ROCrate",
    name: name,
    isPartOf: [],
    keywords: keywords,
    description: description,
    author: author,
    "@graph": [],
  };

  // Add packageType to the metadata if it's provided
  if (packageType) {
    roCrateInstanceMetadata.packageType = packageType;
  }

  if (organizationName) {
    const organizationGuid = `ark:${NAAN}/organization-${organizationName
      .toLowerCase()
      .replace(" ", "-")}-${generateDatetimeSquid()}`;
    roCrateInstanceMetadata.isPartOf.push({
      "@id": organizationGuid,
      "@type": "Organization",
      name: organizationName,
    });
  }

  if (projectName) {
    const projectGuid = `ark:${NAAN}/project-${projectName
      .toLowerCase()
      .replace(" ", "-")}-${generateDatetimeSquid()}`;
    roCrateInstanceMetadata.isPartOf.push({
      "@id": projectGuid,
      "@type": "Project",
      name: projectName,
    });
  }

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
    this.metadataType = "https://w3id.org/EVI#ROCrate";
    this.name = name;
    this.description = description;
    this.author = author;
    this.keywords = keywords;
    this.projectName = projectName;
    this.organizationName = organizationName;
    this.path = path;
    this.metadataGraph = [];
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

    const roCrateMetadata = {
      "@id": this.guid,
      "@context": DEFAULT_CONTEXT,
      "@type": "EVI:Dataset",
      name: this.name,
      description: this.description,
      keywords: this.keywords,
      isPartOf: [],
      "@graph": [],
    };

    if (this.organizationName) {
      const organizationGuid = `ark:${NAAN}/organization-${this.organizationName
        .toLowerCase()
        .replace(" ", "-")}-${generateDatetimeSquid()}`;
      roCrateMetadata.isPartOf.push({
        "@id": organizationGuid,
        "@type": "Organization",
        name: this.organizationName,
      });
    }

    if (this.projectName) {
      const projectGuid = `ark:${NAAN}/project-${this.projectName
        .toLowerCase()
        .replace(" ", "-")}-${generateDatetimeSquid()}`;
      roCrateMetadata.isPartOf.push({
        "@id": projectGuid,
        "@type": "Project",
        name: this.projectName,
      });
    }

    fs.writeFileSync(
      roCrateMetadataPath,
      JSON.stringify(roCrateMetadata, null, 2)
    );
  }

  copyObject(sourceFilepath, destinationFilepath) {
    if (!sourceFilepath) {
      throw new Error("source path is None");
    }

    if (!destinationFilepath) {
      throw new Error("destination path is None");
    }

    if (!fs.existsSync(sourceFilepath)) {
      throw new Error(`sourcePath: ${sourceFilepath} Doesn't Exist`);
    }

    fs.copyFileSync(sourceFilepath, destinationFilepath);
  }

  registerObject(model) {
    const metadataPath = path.join(this.path, "ro-crate-metadata.json");
    const roCrateMetadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
    roCrateMetadata["@graph"].push(model);
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
    // In JavaScript, we might want to return an array of objects instead of using PrettyTable
    return this.metadataGraph.map((element) => ({
      ro_crate: "*",
      id: element.guid,
      type: element.type,
      name: element.name,
    }));
  }
}

function readROCrateMetadata(cratePath) {
  const metadataCratePath = cratePath.includes("ro-crate-metadata.json")
    ? cratePath
    : path.join(cratePath, "ro-crate-metadata.json");

  const crateMetadata = JSON.parse(fs.readFileSync(metadataCratePath, "utf8"));
  return crateMetadata;
}

function appendCrate(cratePath, elements) {
  if (fs.statSync(cratePath).isDirectory()) {
    cratePath = path.join(cratePath, "ro-crate-metadata.json");
  }

  if (elements.length === 0) {
    return null;
  }

  const roCrateMetadata = JSON.parse(fs.readFileSync(cratePath, "utf8"));
  elements.forEach((element) => {
    roCrateMetadata["@graph"].push(element);
  });

  fs.writeFileSync(cratePath, JSON.stringify(roCrateMetadata, null, 2));
}

function copyToROCrate(sourceFilepath, destinationFilepath) {
  if (!sourceFilepath) {
    throw new Error("source path is None");
  }

  if (!destinationFilepath) {
    throw new Error("destination path is None");
  }

  if (!fs.existsSync(sourceFilepath)) {
    throw new Error(`sourcePath: ${sourceFilepath} Doesn't Exist`);
  }

  fs.copyFileSync(sourceFilepath, destinationFilepath);
}

module.exports = {
  generateROCrate,
  ROCrate,
  readROCrateMetadata,
  appendCrate,
  copyToROCrate,
};
