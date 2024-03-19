* 3 modes:
  
  * normal mode ( press esc)
  * insert mode (press i)
  * visual mode (press v)
    * Can select text then decide what to do with it
* to move like arrows keys, use h, j, k, l

* to move via words, use w, b, e
  
  * w start of next word
  * e to end of a word
  * b moves to the beginning of a word
* You can combine movement keys with a number
  
  * Example: 3w will move 3 words forward
  * You can insert multiple times to0
    * `30i- Esc`
* You can find the next occurrence of a character with `f`
  
  * Prev (F)
  * `fo` finds the next o
* You can jump to the start/end of a set of brackets (`(`, `[`, `{`) with `%`

* To reach the beginning of a line: `0`

* End of a line `$`

* To find the next occurrence of a word under the cursor: `*`
  
  * Prev: `#`
* `gg` top of the file

* `G` end of the file

* Direct line number: `numberG`
  
  * `2G`: line 2
* You can search for text with `/`
  
  * Next occurrence: `n`
  * Prev: `N`
* Insert text into a new line: `o` or `O`

* `x` deletes text left of the cursor

* You can replace a single character under the cursor with `r`
  
  * Then type the char to replace
* `d` is delete command
  
  * Can be combined with movement
    * `dw` deletes the word right of the cursor
    * `d2e` deletes 2 words right
* To repeat the prev command: `.`

* ANy problems type: `:help`

## NeoVIM
