const validateProductBody = (body) => {
  const errors = [];
  
  const allowedFields = [
    "name", "variety", "description", "category", "pricePerUnit", "unit",
    "quantityAvailable", "images", "isOrganic", "isCertified", "certificationDetails",
    "harvestDate", "expiryDate", "location", "deliveryAvailable", "deliveryRadiusKm", "status"
  ];

  // Enforce no unknown fields (prevent mass assignment)
  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) {
      errors.push(`Unknown field: '${key}' is not allowed`);
    }
  }

  // Required Fields
  if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
    errors.push("Field 'name' is required and must be a non-empty string");
  }
  if (!body.description || typeof body.description !== "string" || !body.description.trim()) {
    errors.push("Field 'description' is required and must be a non-empty string");
  }
  if (!body.category || typeof body.category !== "string" || !body.category.trim()) {
    errors.push("Field 'category' is required");
  } else if (!["vegetable", "fruit", "grain", "pulse", "herb", "spice", "other"].includes(body.category)) {
    errors.push("Field 'category' must be one of: vegetable, fruit, grain, pulse, herb, spice, other");
  }

  if (body.pricePerUnit === undefined || typeof body.pricePerUnit !== "number" || body.pricePerUnit <= 0) {
    errors.push("Field 'pricePerUnit' is required and must be a number greater than 0");
  }
  if (body.quantityAvailable === undefined || typeof body.quantityAvailable !== "number" || body.quantityAvailable <= 0) {
    errors.push("Field 'quantityAvailable' is required and must be a number greater than 0");
  }

  // Optional/Enum Validation
  if (body.unit && typeof body.unit !== "string") {
    errors.push("Field 'unit' must be a string");
  }
  if (body.variety && typeof body.variety !== "string") {
    errors.push("Field 'variety' must be a string");
  }
  if (body.harvestDate && isNaN(Date.parse(body.harvestDate))) {
    errors.push("Field 'harvestDate' must be a valid date string");
  }
  if (body.expiryDate && isNaN(Date.parse(body.expiryDate))) {
    errors.push("Field 'expiryDate' must be a valid date string");
  }
  if (body.status && !["available", "out_of_stock", "unavailable"].includes(body.status)) {
    errors.push("Field 'status' must be one of: available, out_of_stock, unavailable");
  }
  if (body.deliveryAvailable !== undefined && typeof body.deliveryAvailable !== "boolean") {
    errors.push("Field 'deliveryAvailable' must be a boolean");
  }
  if (body.deliveryRadiusKm !== undefined && (typeof body.deliveryRadiusKm !== "number" || body.deliveryRadiusKm < 0)) {
    errors.push("Field 'deliveryRadiusKm' must be a non-negative number");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateProductUpdateBody = (body) => {
  const errors = [];
  
  const allowedFields = [
    "name", "variety", "description", "category", "pricePerUnit", "unit",
    "quantityAvailable", "images", "isOrganic", "isCertified", "certificationDetails",
    "harvestDate", "expiryDate", "location", "deliveryAvailable", "deliveryRadiusKm", "status"
  ];

  // Enforce no unknown fields
  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) {
      errors.push(`Unknown field: '${key}' is not allowed`);
    }
  }

  if (body.name !== undefined && (typeof body.name !== "string" || !body.name.trim())) {
    errors.push("Field 'name' must be a non-empty string");
  }
  if (body.description !== undefined && (typeof body.description !== "string" || !body.description.trim())) {
    errors.push("Field 'description' must be a non-empty string");
  }
  if (body.category !== undefined && !["vegetable", "fruit", "grain", "pulse", "herb", "spice", "other"].includes(body.category)) {
    errors.push("Field 'category' must be one of: vegetable, fruit, grain, pulse, herb, spice, other");
  }
  if (body.pricePerUnit !== undefined && (typeof body.pricePerUnit !== "number" || body.pricePerUnit <= 0)) {
    errors.push("Field 'pricePerUnit' must be a number greater than 0");
  }
  if (body.quantityAvailable !== undefined && (typeof body.quantityAvailable !== "number" || body.quantityAvailable <= 0)) {
    errors.push("Field 'quantityAvailable' must be a number greater than 0");
  }
  if (body.harvestDate && isNaN(Date.parse(body.harvestDate))) {
    errors.push("Field 'harvestDate' must be a valid date string");
  }
  if (body.expiryDate && isNaN(Date.parse(body.expiryDate))) {
    errors.push("Field 'expiryDate' must be a valid date string");
  }
  if (body.status !== undefined && !["available", "out_of_stock", "unavailable"].includes(body.status)) {
    errors.push("Field 'status' must be one of: available, out_of_stock, unavailable");
  }
  if (body.deliveryAvailable !== undefined && typeof body.deliveryAvailable !== "boolean") {
    errors.push("Field 'deliveryAvailable' must be a boolean");
  }
  if (body.deliveryRadiusKm !== undefined && (typeof body.deliveryRadiusKm !== "number" || body.deliveryRadiusKm < 0)) {
    errors.push("Field 'deliveryRadiusKm' must be a non-negative number");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  validateProductBody,
  validateProductUpdateBody
};
