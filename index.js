const fs = require('fs');

function readCSVData(fileName) {
  return new Promise((resolve, reject) => {
    fs.readFile(fileName + '.csv', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function parseCSV(str) {
  let arr = [];
  let quote = false; 

  for (let row = 0, col = 0, c = 0; c < str.length; c++) {
      let cc = str[c], nc = str[c+1];        
      arr[row] = arr[row] || [];             
      arr[row][col] = arr[row][col] || '';   

      if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
      if (cc == '"') { quote = !quote; continue; }
      if (cc == ',' && !quote) { ++col; continue; }
      if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
      if (cc == '\n' && !quote) { ++row; col = 0; continue; }
      if (cc == '\r' && !quote) { ++row; col = 0; continue; }

      arr[row][col] += cc;
  }
  return arr;
}


function getAllListNames(data) {
  let names = [];
  parseCSV(data).forEach((row, idx) => {
    if (idx > 0) {
      names.push(row[0]);
    }
  });

  return names;
}

function getCertificateNumber(data) {
  let certificateNumber = [];
  parseCSV(data).forEach((row, idx) => {
    if (idx > 0) {
      certificateNumber.push(row[1].split('/')[0]);
    }
  });

  return certificateNumber;
}

function renameDataSetFileNames(data) {
  const listName = getAllListNames(data)
  const certificateNumber = getCertificateNumber(data);

  listName.forEach((name, idx) => {
    if (!fs.existsSync(`./Data Set ${idx + 1}.pdf`)) {
      console.log(`Data Set ${idx + 1}.pdf does not exist`);
      return false
    }

    fs.rename(`./Data Set ${idx + 1}.pdf`, `./${certificateNumber[idx]} - ${name}.pdf`, (err) => {
      if (err) throw err;
      console.log('Rename complete!');
    });
  });
}


function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('Please provide a file name');
    return;
  }

  console.log(`Progate Tools - Rename Data Set File Names`);
  console.log(`-------------------------------------------`);
  readCSVData(args[0])
    .then(data => {
      renameDataSetFileNames(data);
    })
    .catch(err => {
      console.log(err);
    });
}

main();
