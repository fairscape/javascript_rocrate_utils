const path = require("path");
const { v4: uuidv4 } = require("uuid");

const NAAN = "59852";

function generateDatetimeSquid() {
  return uuidv4().split("-")[0];
}

class Software {
  constructor(data) {
    this.guid = data["@id"] || null;
    this.metadataType = data["@type"] || "https://w3id.org/EVI#Software";
    this.author = data.author;
    this.dateModified = data.dateModified;
    this.version = data.version;
    this.description = data.description;
    this.associatedPublication = data.associatedPublication || null;
    this.additionalDocumentation = data.additionalDocumentation || null;
    this.fileFormat = data.format;
    this.usedByComputation = data.usedByComputation || null;
    this.contentUrl = data.contentUrl || null;
    this.name = data.name;
    this.url = data.url;
    this.keywords = data.keywords;
  }
}

function generateSoftware({
  guid,
  name,
  author,
  version,
  description,
  keywords,
  fileFormat,
  url,
  dateModified,
  filepath,
  usedByComputation,
  associatedPublication,
  additionalDocumentation,
  cratePath,
}) {
  if (!guid) {
    const sq = generateDatetimeSquid();
    guid = `ark:${NAAN}/software-${name.toLowerCase().replace(" ", "-")}-${sq}`;
  }

  const softwareMetadata = {
    "@id": guid,
    "@context": {
      "@vocab": "https://schema.org/",
      EVI: "https://w3id.org/EVI#",
    },
    "@type": "https://w3id.org/EVI#Software",
    url: url,
    name: name,
    author: author,
    dateModified: dateModified,
    description: description,
    keywords: keywords,
    version: version,
    associatedPublication: associatedPublication,
    additionalDocumentation: additionalDocumentation,
    format: fileFormat,
    usedByComputation:
      typeof usedByComputation === "string"
        ? usedByComputation.split(",").map((item) => item.trim())
        : [],
  };

  if (filepath) {
    if (filepath.startsWith("http")) {
      softwareMetadata.contentUrl = filepath;
    } else {
      const fs = require("fs");
      const rocratePath = cratePath.includes("ro-crate-metadata.json")
        ? path.dirname(cratePath)
        : cratePath;
      const softwarePath = path.resolve(filepath);
      if (fs.existsSync(softwarePath)) {
        try {
          const relativePath = path.relative(rocratePath, softwarePath);
          softwareMetadata.contentUrl = `file:///${relativePath.replace(
            /\\/g,
            "/"
          )}`;
        } catch (error) {
          throw new Error(`File not in crate: ${softwarePath}`);
        }
      } else {
        throw new Error(`Software File Does Not Exist: ${softwarePath}`);
      }
    }
  }

  return softwareMetadata; // Return the metadata object directly
}

module.exports = {
  Software,
  generateSoftware,
};
