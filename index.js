import { generateEvidenceGraphs } from "./models/evidence_graph_builder.js";
import { Computation, generateComputation } from "./models/computation.js";
import { Dataset, generateDataset } from "./models/dataset.js";
import { Software, generateSoftware } from "./models/software.js";
import { Schema, generateSchema, addProperty } from "./models/schema.js";
import {
  generateROCrate,
  ROCrate,
  readROCrateMetadata,
  appendCrate,
  copyToROCrate,
} from "./models/rocrate.js";

// Import high-level ROCrate functions
import {
  get_ro_crate_metadata,
  register_schema,
  get_registered_files,
  rocrate_init,
  rocrate_create,
  register_software,
  register_dataset,
  register_computation,
  add_software,
  add_dataset,
} from "./rocrate/rocrate.js";

// Import tabular schema functionality
import {
  FileType,
  DatatypeEnum,
  TabularValidationSchema,
  HDF5Schema,
  StringProperty,
  NumberProperty,
} from "./rocrate/tabularSchema.js";

// Constants
export const DEFAULT_CONTEXT = {
  "@vocab": "https://schema.org/",
  sh: "http://www.w3.org/ns/shacl#",
  EVI: "https://w3id.org/EVI#",
};

export const NAAN = "99999"; // You might want to make this configurable

// Export everything
export {
  // Evidence Graph Builder exports
  generateEvidenceGraphs,

  // Computation exports
  Computation,
  generateComputation,

  // Dataset exports
  Dataset,
  generateDataset,

  // ROCrate core functionality
  generateROCrate,
  ROCrate,
  readROCrateMetadata,
  appendCrate,
  copyToROCrate,

  // Software exports
  Software,
  generateSoftware,

  // Schema exports
  Schema,
  generateSchema,
  addProperty,

  // High-level ROCrate functions
  get_ro_crate_metadata,
  register_schema,
  get_registered_files,
  rocrate_init,
  rocrate_create,
  register_software,
  register_dataset,
  register_computation,
  add_software,
  add_dataset,

  // Tabular Schema exports
  FileType,
  DatatypeEnum,
  TabularValidationSchema,
  HDF5Schema,
  StringProperty,
  NumberProperty,
};
