const {
  generateEvidenceGraphs,
} = require("./src/rocrate/evidence_graph_builder.js");
const {
  Computation,
  generateComputation,
} = require("./src/models/computation.js");
const { Dataset, generateDataset } = require("./src/models/dataset.js");
const { Software, generateSoftware } = require("./src/models/software.js");
const {
  Schema,
  generateSchema,
  addProperty,
} = require("./src/models/schema.js");
const {
  generateROCrate,
  ROCrate,
  readROCrateMetadata,
  appendCrate,
  copyToROCrate,
} = require("./src/models/rocrate.js");

// Import high-level ROCrate functions
const {
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
} = require("./src/rocrate/rocrate.js");

// Constants
const DEFAULT_CONTEXT = {
  "@vocab": "https://schema.org/",
  sh: "http://www.w3.org/ns/shacl#",
  EVI: "https://w3id.org/EVI#",
};

const NAAN = "99999"; // You might want to make this configurable

// Export everything
module.exports = {
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
  // Constants
  DEFAULT_CONTEXT,
  NAAN,
};
