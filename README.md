# D&D-inventory-management
A program I made to help with inventory/health/money/status effects etc for a homebrew d&d campaign.

This took me several weeks to make but I'm pretty proud of it!


 
 ‎ 
 ‎
 
 
Some notes: 

• All data you input, including images, is automatically saved to local storage, which might get full after a while. This might make the program crash after a while of use. I recommend using fairly low-resolution images or figuring out how to raise your browser's local storage.

• This is a very newly made program, so it may break or something, my apologies if so.

• All 3 files must be in the same folder on your computer.

• Feel free to edit this as you'd like for your own purposes! :)

‎ 

‎ 

‎ 
Available commands list:


Note - All these commands apply to the inventory currently on screen.


`add <item name> <amount>` - add an item to the inventory

`money <num>` - raise or lower money by an amount

`use <item name>` - lower the present amount of an item in the inventory

`heal <amount>` - add health to the current character

`damage <amount>` - remove health from the current character

`health <amount>` | `health max <amount>` - set the current health or character's max health

`status <name> <image> <item name>` | `status remove <name>` - add or remove status effects


‎ 

‎ 

‎ 
How to use:


  1. Download all 3 files( js, html, css ) and put them together in a folder, preferable on their own.
 
  2. Open the html file in a compatible browser on a computer. I recommend firefox but chrome and others will probably work too.
 
  3. Refresh the page.
 
  4. Add your characters!


‎ 

‎ 

‎ 
Making Characters:


  1. Click the add character or just edit the existing one.

  2. Enter the character's name, description, and image.

  3. Enter `health max <number>` to set the character's max health.

  4. Use the item library and `add` command to deck out the character's inventory!


‎ 

‎ 

‎ 
Adding items:


  1. Click the item library button in the top right.
 
  2. Select an image file for your new item, or drag and drop it onto the box. I suggest you use images with transparent backgrounds, via a tool such as remove.bg, as it looks much cleaner in the inventory.
 
  3. Enter a name for your item. If no name is entered, clicking add item will make the new item name be the name of the file.

  
      • If you have many premade items, rename the files and select the option to automatically add image items. This will make that each time you select an image or drag it on, it will be added as an item with the name being the name of the file.


‎ 

‎ 

‎ 
Inventory management:

   • To add an item to a character's inventory, type `add <item name> <optional item amount>` in the command bar at the bottom of the page. This automatically adds the item to the first available inventory slot.
  
   • Click on items to up or reduce the amount of an item, or just delete the item from the inventory.
  
   • Click and drag items to move them to other inventory slots. If the dropped-on slot is filled, the items will swap places. If the dropped-on slot is the same as the dragged item, the amount of the dragged-on slot will go up by however many were in the old slot.

   • Type `money <num>` in the command bar to make the character's money go up or down. Positive numbers (8, 14) will make the money go up, while negative numbers (-10, -67) will take money away.
 
   • You can type `use item` to make the item go down by one. 


‎ 

‎ 

‎ 
Health management:


  • This one is pretty simple, you type `damage <num>` or `heal <num>` in the command bar to raise or lower the character's health. You can also use `health <num>` to set the health to a value or `health max <num>` to set the character's max health.


‎ 

‎ 

‎ 
Status Effects:

  • Type `status <name of status effect> <image(optional)> <name of item to use as image>` in the command bar to add a status effect to the character. Adding image after the name will use the next text as the name of an item to display beside the text of the status effect. If an image is not used, it will simple be displayed as a bulleted text. 
  • To remove effects, type `status remove <name of status effect`
  • Usage examples: `status Poison image Poison vial` | `status Bleeding image sword` | `status Withered flesh` | `status remove Sickness`
