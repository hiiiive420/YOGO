function parseArrayField(value) {
  if (value === undefined || value === null) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith('[')) {
      const parsed = JSON.parse(trimmed);

      if (!Array.isArray(parsed)) {
        throw new Error('Expected a JSON array');
      }

      return parsed.map((item) => String(item).trim()).filter(Boolean);
    }

    return trimmed
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [String(value).trim()].filter(Boolean);
}

module.exports = {
  parseArrayField,
};
