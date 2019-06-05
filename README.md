# Cross-O-Tron
Crossotron is a CSharp app that runs Node, Angular, and Express and interacts with a Postrgres database. It includes an API and an Angular frontend. Its features include:

**Reads Database**
Aids in the writing of crossword puzzles by scanning a database of over 5,000 words, returning the words that match a given letter/vowel/consonant pattern. For example, the search string 'B010101' would return all words that start with B followed by three alternating vowels and consonants such as 'BANANAS' 'BENEFIT' and 'BODEGAS'

**Create Word**
Inserts new words into the database following a cleaning process of removing punctuation and extracting the character at each position into an array. Multiple words can be added at the same time. Also includes Parse.js which runs through this process for each word in a given text file.

**Update and Delete**
The Crossotron never makes mistakes, but it can update and delete words anyway.

**Crossotron.js**
Using the Crossotron database, fills out 4*4 crossword puzzle for a hardcoded start point. Example output:

For puzzle:
[ [ 'T', 'H', 'O', 'R' ],
  [ 'R', 0, 1, 0 ],
  [ 'O', 1, 0, 1 ],
  [ 'N', 0, 1, 1 ] ]

Found solution:
[ [ 'T', 'H', 'O', 'R' ],
  [ 'R', 'A', 'R', 'E' ],
  [ 'O', 'V', 'E', 'N' ],
  [ 'N', 'E', 'S', 'T' ] ]