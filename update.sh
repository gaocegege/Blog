#!/bin/sh
git status
echo "input the path to add"
read path
git add $path
git status
echo "any char to continue"
read path
echo "the commit comments"
read comments
$comments = "\"" ${comments} "\""
echo $comments
git commit -m $comments
git push -u origin gh_pages
