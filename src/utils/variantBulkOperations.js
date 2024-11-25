import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const flattenVariants = (variants) => {
  return variants.flatMap(variant => 
    variant.options.map(option => ({
      type: variant.type,
      name: option.name,
      price: option.price,
      stock: option.stock,
      sku: option.sku,
      barcode: option.barcode,
      weight: option.shippingRules?.weight || '',
      length: option.shippingRules?.dimensions?.length || '',
      width: option.shippingRules?.dimensions?.width || '',
      height: option.shippingRules?.dimensions?.height || '',
      additionalCost: option.shippingRules?.additionalCost || '',
      specialHandling: option.shippingRules?.specialHandling || false,
    }))
  );
};

export const exportVariants = (variants, format = 'xlsx') => {
  const flattenedData = flattenVariants(variants);
  
  switch (format) {
    case 'xlsx':
      return exportToExcel(flattenedData);
    case 'csv':
      return exportToCSV(flattenedData);
    case 'json':
      return exportToJSON(flattenedData);
    default:
      throw new Error('Unsupported export format');
  }
};

const exportToExcel = (data) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Add column widths
  const colWidths = [
    { wch: 15 }, // type
    { wch: 20 }, // name
    { wch: 10 }, // price
    { wch: 10 }, // stock
    { wch: 20 }, // sku
    { wch: 20 }, // barcode
    { wch: 10 }, // weight
    { wch: 10 }, // length
    { wch: 10 }, // width
    { wch: 10 }, // height
  ];
  worksheet['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Variants');
  XLSX.writeFile(workbook, 'variants.xlsx');
};

const exportToCSV = (data) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(value => 
      typeof value === 'string' ? `"${value}"` : value
    ).join(',')
  );
  
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'variants.csv');
};

const exportToJSON = (data) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  saveAs(blob, 'variants.json');
};

export const importVariants = async (file, format = 'xlsx') => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        let data;
        
        switch (format) {
          case 'xlsx':
            data = parseExcel(e.target.result);
            break;
          case 'csv':
            data = parseCSV(e.target.result);
            break;
          case 'json':
            data = parseJSON(e.target.result);
            break;
          default:
            throw new Error('Unsupported import format');
        }
        
        const groupedVariants = groupVariantData(data);
        resolve(groupedVariants);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    
    switch (format) {
      case 'xlsx':
        reader.readAsBinaryString(file);
        break;
      case 'csv':
      case 'json':
        reader.readAsText(file);
        break;
    }
  });
};

const parseExcel = (data) => {
  const workbook = XLSX.read(data, { type: 'binary' });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(worksheet);
};

const parseCSV = (data) => {
  const lines = data.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
};

const parseJSON = (data) => {
  return JSON.parse(data);
};

const groupVariantData = (data) => {
  return Object.values(data.reduce((acc, row) => {
    if (!acc[row.type]) {
      acc[row.type] = {
        type: row.type,
        options: [],
      };
    }
    
    acc[row.type].options.push({
      name: row.name,
      price: parseFloat(row.price),
      stock: parseInt(row.stock),
      sku: row.sku,
      barcode: row.barcode,
      shippingRules: {
        weight: row.weight,
        dimensions: {
          length: row.length,
          width: row.width,
          height: row.height,
        },
        additionalCost: row.additionalCost,
        specialHandling: row.specialHandling,
      },
    });
    
    return acc;
  }, {}));
}; 