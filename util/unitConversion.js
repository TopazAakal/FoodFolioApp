const pluralUnits = {
  'מ"ל': "מיליליטרים",
  ליטר: "ליטרים",
  'מ"ג': "מיליגרם",
  גרם: "גרם",
  'ק"ג': "קילוגרם",
  כוס: "כוסות",
  כף: "כפות",
  כפית: "כפיות",
  יחידה: "יחידות",
  קורט: "קורט",
};

const singularUnits = {
  מיליליטרים: 'מ"ל',
  ליטרים: "ליטר",
  מיליגרם: 'מ"ג',
  גרם: "גרם",
  קילוגרם: 'ק"ג',
  כוסות: "כוס",
  כפות: "כף",
  כפיות: "כפית",
  יחידות: "יחידה",
  קורט: "קורט",
};

export const formatUnit = (quantity, unit) => {
  if (quantity > 1 && pluralUnits[unit]) {
    return pluralUnits[unit];
  } else if (quantity <= 1) {
    return singularUnits[unit] || unit;
  }
  return unit;
};
