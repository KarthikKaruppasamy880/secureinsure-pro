const TPPExcelParser = require('../src/services/tppExcelParser').default;

async function generateInsuranceFields() {
  try {
    const parser = new TPPExcelParser();
    const jsonContent = await parser.generateInsuranceFieldsJson();
    
    // Write to config file
    const fs = require('fs');
    const path = require('path');
    
    const configPath = path.join(__dirname, '../src/config/insuranceFields.json');
    fs.writeFileSync(configPath, jsonContent);
    
    console.log('✅ Insurance fields JSON generated successfully!');
    console.log(`📁 File saved to: ${configPath}`);
    console.log('🔍 Check the file to verify canonical labels are correct');
    
  } catch (error) {
    console.error('❌ Error generating insurance fields:', error);
    process.exit(1);
  }
}

generateInsuranceFields();
