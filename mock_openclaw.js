const args = process.argv.slice(2);
if (args.includes('config') && args.includes('get')) {
  console.log('{}');
} else {
  console.log('ok');
}
