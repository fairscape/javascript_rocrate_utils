const { v4: uuidv4 } = require("uuid");

const NAAN = "59852";

function generateDatetimeSquid() {
  return uuidv4().split("-")[0];
}

class Computation {
  constructor(data) {
    this.guid = data["@id"] || null;
    this.metadataType = data["@type"] || "https://w3id.org/EVI#Computation";
    this.runBy = data.runBy;
    this.dateCreated = data.dateCreated;
    this.description = data.description;
    this.associatedPublication = data.associatedPublication || null;
    this.additionalDocumentation = data.additionalDocumentation || null;
    this.command = data.command || "";
    this.usedSoftware = data.usedSoftware || [];
    this.usedDataset = data.usedDataset || [];
    this.generated = data.generated || [];
    this.name = data.name;
    this.keywords = data.keywords;
  }
}

function generateComputation({
  guid,
  name,
  runBy,
  command,
  dateCreated,
  description,
  keywords,
  usedSoftware,
  usedDataset,
  generated,
}) {
  if (!guid) {
    const sq = generateDatetimeSquid();
    guid = `ark:${NAAN}/computation-${name
      .toLowerCase()
      .replace(/\s+/g, "-")}-${sq}`;
  }

  const computationMetadata = {
    "@id": guid,
    "@context": {
      "@vocab": "https://schema.org/",
      EVI: "https://w3id.org/EVI#",
    },
    "@type": "https://w3id.org/EVI#Computation",
    name: name,
    description: description,
    keywords: keywords,
    runBy: runBy,
    command: command,
    dateCreated: dateCreated,
    usedSoftware: Array.isArray(usedSoftware)
      ? usedSoftware
      : typeof usedSoftware === "string"
      ? usedSoftware.split(",").map((item) => item.trim())
      : [],
    usedDataset: Array.isArray(usedDataset)
      ? usedDataset
      : typeof usedDataset === "string"
      ? usedDataset.split(",").map((item) => item.trim())
      : [],
    generated: Array.isArray(generated)
      ? generated
      : typeof generated === "string"
      ? generated.split(",").map((item) => item.trim())
      : [],
  };

  return computationMetadata;
}

module.exports = {
  Computation,
  generateComputation,
};
