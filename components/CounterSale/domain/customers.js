export function filterCustomers({ allCustomers, customerName, customerPhone, customersEnabled }) {
  if (!customersEnabled || !Array.isArray(allCustomers)) return [];
  if (!customerPhone && !customerName) return [];
  
  const lowerName = String(customerName || '').toLowerCase();
  const phoneVal = String(customerPhone || '');
  
  return allCustomers.filter(c => {
    const matchesPhone = c.phone && String(c.phone).includes(phoneVal);
    const matchesName = c.name && String(c.name).toLowerCase().includes(lowerName);
    return matchesPhone || matchesName;
  }).slice(0, 5);
}
