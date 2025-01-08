import path from "path";
import fs from "fs";
import {
  generateROCrate,
  ROCrate,
  readROCrateMetadata,
  appendCrate,
  copyToROCrate,
} from "../models/rocrate";
import { generateSoftware } from "../models/software";
import { generateDataset } from "../models/dataset";
import { generateComputation } from "../models/computation";
import { generateSchema } from "../models/schema"; // Assume this is implemented similarly to generateDataset

export function get_ro_crate_metadata(rocratePath) {
  const metadataPath = path.join(rocratePath, "ro-crate-metadata.json");

  try {
    const rawData = fs.readFileSync(metadataPath, "utf8");
    const metadata = JSON.parse(rawData);
    return metadata;
  } catch (error) {
    console.error("Error reading RO-Crate metadata:", error);
    return null;
  }
}

export function register_schema(
  rocrate_path,
  name,
  description,
  properties,
  required,
  separator,
  header,
  guid = null,
  url = null,
  additionalProperties = true,
  examples = []
) {
  try {
    const crateInstance = readROCrateMetadata(rocrate_path);
    const schema_instance = generateSchema({
      guid,
      url,
      name,
      description,
      properties,
      required,
      separator,
      header,
      additionalProperties,
      examples,
    });
    appendCrate(rocrate_path, [schema_instance]);
    return schema_instance["@id"];
  } catch (error) {
    throw new Error(`Error registering schema: ${error.message}`);
  }
}

export async function get_registered_files(rocratePath) {
  try {
    if (!rocratePath) {
      throw new Error("Please select an RO-Crate directory.");
    }

    const fileList = await fs.promises.readdir(rocratePath);
    const metadataExists = fileList.includes("ro-crate-metadata.json");

    if (!metadataExists) {
      throw new Error(
        "The selected directory is not a valid RO-Crate. It should contain an ro-crate-metadata.json file."
      );
    }

    const metadataPath = path.join(rocratePath, "ro-crate-metadata.json");
    const metadata = JSON.parse(
      await fs.promises.readFile(metadataPath, "utf8")
    );

    const registeredFiles = metadata["@graph"]
      .filter((item) => item.contentUrl && item["@type"] !== "CreativeWork")
      .map((item) => ({
        guid: item["@id"],
        name: normalizePath(item.contentUrl.replace("file://", "")),
      }));

    return registeredFiles;
  } catch (error) {
    console.error("Error reading RO-Crate metadata:", error);
    throw new Error(
      "Error reading RO-Crate metadata. Please make sure the path is correct and accessible."
    );
  }
}

function normalizePath(filePath) {
  return filePath.replace(/^\//, "").replace(/\\/g, "/");
}

export function rocrate_init(
  name,
  organization_name,
  project_name,
  description,
  keywords,
  guid = ""
) {
  const passed_crate = generateROCrate({
    guid,
    name,
    organizationName: organization_name,
    projectName: project_name,
    description,
    keywords,
    path: process.cwd(),
  });
  return passed_crate.guid;
}

export function rocrate_create(
  rocrate_path,
  name,
  organization_name,
  project_name,
  description,
  author,
  keywords,
  packageType,
  guid = ""
) {
  const passed_crate = generateROCrate({
    path: rocrate_path,
    guid,
    name,
    organizationName: organization_name,
    projectName: project_name,
    description,
    author,
    keywords,
    packageType,
  });
  return passed_crate["@id"];
}

export function register_software(
  rocrate_path,
  name,
  author,
  version,
  description,
  keywords,
  file_format,
  guid = null,
  url = null,
  date_modified = null,
  filepath = null,
  used_by_computation = [],
  associated_publication = null,
  additional_documentation = null
) {
  try {
    const crateInstance = readROCrateMetadata(rocrate_path);
    const software_instance = generateSoftware({
      guid,
      url,
      name,
      version,
      keywords,
      fileFormat: file_format,
      description,
      author,
      associatedPublication: associated_publication,
      additionalDocumentation: additional_documentation,
      dateModified: date_modified,
      usedByComputation: used_by_computation,
      filepath,
      cratePath: rocrate_path,
    });
    appendCrate(rocrate_path, [software_instance]);
    return software_instance["@id"];
  } catch (error) {
    throw new Error(`Error registering software: ${error.message}`);
  }
}

export function register_dataset(
  rocrate_path,
  name,
  author,
  version,
  date_published,
  description,
  keywords,
  data_format,
  filepath,
  guid = null,
  url = null,
  used_by = [],
  derived_from = [],
  schema = null,
  associated_publication = null,
  additional_documentation = null
) {
  try {
    const crate_instance = readROCrateMetadata(rocrate_path);
    const dataset_instance = generateDataset({
      guid,
      url,
      author,
      name,
      description,
      keywords,
      datePublished: date_published,
      version,
      associatedPublication: associated_publication,
      additionalDocumentation: additional_documentation,
      dataFormat: data_format,
      schema,
      derivedFrom: derived_from,
      usedBy: used_by,
      filepath,
      cratePath: rocrate_path,
    });
    appendCrate(rocrate_path, [dataset_instance]);
    return dataset_instance["@id"];
  } catch (error) {
    throw new Error(`Error registering dataset: ${error.message}`);
  }
}

export function register_computation(
  rocrate_path,
  name,
  run_by,
  date_created,
  description,
  keywords,
  guid = null,
  command = null,
  used_software = [],
  used_dataset = [],
  generated = []
) {
  try {
    const crateInstance = readROCrateMetadata(rocrate_path);
    const computationInstance = generateComputation({
      guid,
      name,
      runBy: run_by,
      command,
      dateCreated: date_created,
      description,
      keywords,
      usedSoftware: used_software,
      usedDataset: used_dataset,
      generated,
    });
    appendCrate(rocrate_path, [computationInstance]);
    return computationInstance["@id"];
  } catch (error) {
    console.error("Error in register_computation:", error);
    throw new Error(`Error registering computation: ${error.message}`);
  }
}

export function add_software(
  rocrate_path,
  name,
  author,
  version,
  description,
  keywords,
  file_format,
  source_filepath,
  destination_filepath,
  date_modified,
  guid = null,
  url = null,
  used_by_computation = [],
  associated_publication = null,
  additional_documentation = null
) {
  try {
    const crateInstance = readROCrateMetadata(rocrate_path);
    copyToROCrate(source_filepath, destination_filepath);
    const software_instance = generateSoftware({
      guid,
      url,
      name,
      version,
      keywords,
      fileFormat: file_format,
      description,
      author,
      associatedPublication: associated_publication,
      additionalDocumentation: additional_documentation,
      dateModified: date_modified,
      usedByComputation: used_by_computation,
      filepath: destination_filepath,
      cratePath: rocrate_path,
    });
    appendCrate(rocrate_path, [software_instance]);
    return software_instance["@id"];
  } catch (error) {
    throw new Error(`Error adding software: ${error.message}`);
  }
}

export function add_dataset(
  rocrate_path,
  name,
  author,
  version,
  date_published,
  description,
  keywords,
  data_format,
  source_filepath,
  destination_filepath,
  guid = null,
  url = null,
  used_by = [],
  derived_from = [],
  schema = null,
  associated_publication = null,
  additional_documentation = null
) {
  try {
    console.log("File path rocrate: ", source_filepath);
    const crateInstance = readROCrateMetadata(rocrate_path);
    copyToROCrate(source_filepath, destination_filepath);
    const dataset_instance = generateDataset({
      guid,
      url,
      author,
      name,
      description,
      keywords,
      datePublished: date_published,
      version,
      associatedPublication: associated_publication,
      additionalDocumentation: additional_documentation,
      dataFormat: data_format,
      schema,
      derivedFrom: derived_from,
      usedBy: used_by,
      filepath: destination_filepath,
      cratePath: rocrate_path,
    });
    appendCrate(rocrate_path, [dataset_instance]);
    return dataset_instance["@id"];
  } catch (error) {
    throw new Error(`Error adding dataset: ${error.message}`);
  }
}
