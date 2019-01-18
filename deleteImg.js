fs.readdir('/Users/budgettemp/Downloads/NodeJSPortable/App/NodeJS/Test/jpgimg/', (err, data) => {
if (err) throw err;
 data.forEach(file => {
  fs.unlink('/Users/budgettemp/Downloads/NodeJSPortable/App/NodeJS/Test/jpgimg/'+file, (err) => {
   if (err) throw err;
   console.log('Successfully deleted');
  });
 });
});
