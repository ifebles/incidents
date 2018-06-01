
targetDir=$(dirname `realpath $0`);
tsFile="test.ts";
jsFile="test.js"

timeJS=$(date -d "`stat -c %y $targetDir/$jsFile`" +%s)
timeTS=$(date -d "`stat -c %y $targetDir/$tsFile`" +%s)

if [ $timeJS -lt $timeTS ];
then
    tsc -t es5 --outDir $targetDir $targetDir/$tsFile;
    # tsc -p $targetDir;
fi;

`echo $targetDir/../node_modules/.bin/mocha -t 5000` $targetDir/test.js
