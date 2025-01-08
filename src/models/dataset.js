const path = require("path");
const { v4: uuidv4 } = require("uuid");

const NAAN = "59852";

function generateDatetimeSquid() {
  return uuidv4().split("-")[0];
}

class Dataset {
  constructor(data) {
    this.guid = data["@id"] || null;
    this.metadataType = data["@type"] || "https://w3id.org/EVI#Dataset";
    this.author = data.author;
    this.datePublished = data.datePublished;
    this.version = data.version;
    this.description = data.description;
    this.keywords = data.keywords;
    this.associatedPublication = data.associatedPublication || null;
    this.additionalDocumentation = data.additionalDocumentation || null;
    this.fileFormat = data.format;
    this.dataSchema = data.schema || null;
    this.generatedBy = data.generatedBy || [];
    this.derivedFrom = data.derivedFrom || [];
    this.usedBy = data.usedBy || [];
    this.contentUrl = data.contentUrl || null;
    this.name = data.name;
    this.url = data.url;
  }
}

function generateDataset({
  guid,
  url,
  author,
  name,
  description,
  keywords,
  datePublished,
  version,
  associatedPublication,
  additionalDocumentation,
  dataFormat,
  schema,
  derivedFrom,
  usedBy,
  filepath,
  cratePath,
}) {
  if (!guid) {
    const sq = generateDatetimeSquid();
    guid = `ark:${NAAN}/dataset-${name.toLowerCase().replace(" ", "-")}-${sq}`;
  }

  const datasetMetadata = {
    "@id": guid,
    "@context": {
      "@vocab": "https://schema.org/",
      EVI: "https://w3id.org/EVI#",
    },
    "@type": "https://w3id.org/EVI#Dataset",
    url: url,
    author: author,
    name: name,
    description: description,
    keywords: keywords,
    datePublished: datePublished,
    version: version,
    associatedPublication: associatedPublication,
    additionalDocumentation: additionalDocumentation,
    format: dataFormat,
    schema: schema,
    derivedFrom:
      typeof derivedFrom === "string"
        ? derivedFrom.split(",").map((item) => item.trim())
        : [],
    usedBy:
      typeof usedBy === "string"
        ? usedBy.split(",").map((item) => item.trim())
        : [],
  };

  if (filepath) {
    if (filepath.startsWith("http")) {
      datasetMetadata.contentUrl = filepath;
    } else {
      const fs = require("fs");
      const rocratePath = cratePath.includes("ro-crate-metadata.json")
        ? path.dirname(cratePath)
        : cratePath;
      const datasetPath = path.resolve(filepath);
      if (fs.existsSync(datasetPath)) {
        try {
          const relativePath = path.relative(rocratePath, datasetPath);
          datasetMetadata.contentUrl = `file:///${relativePath.replace(
            /\\/g,
            "/"
          )}`;
        } catch (error) {
          throw new Error(`File not in crate: ${datasetPath}`);
        }
      } else {
        throw new Error(`Dataset File Does Not Exist: ${datasetPath}`);
      }
    }
  }

  return datasetMetadata; // Return the metadata object directly, not wrapped in a Dataset class
}

module.exports = {
  Dataset,
  generateDataset,
};
