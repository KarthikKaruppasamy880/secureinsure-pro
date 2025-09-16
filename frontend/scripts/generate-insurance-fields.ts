import TPPExcelParser from '../src/services/tppExcelParser.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateInsuranceFields() {
  try {
    const parser = new TPPExcelParser();
    const jsonContent = await parser.generateInsuranceFieldsJson();
    
    // Write to config file
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
