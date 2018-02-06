/* Copyright (C) 2018 Zekromaster

This file is part of MinetweakerTS.
MinetweakerTS is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

MinetweakerTS is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with MinetweakerTS.  If not, see <http://www.gnu.org/licenses/>.

*/

// GENERAL LIBRARY
/* This turns (a, b, c) into <a>.b*c*/
export function turnToMinetweakerFormat(item?: string, quantity?: number, tags?: string){
	var returning;
	if (item == null || item == "null"){
		returning = "null";
	}else if (tags && quantity && quantity!=1) {
		returning = "<" + item + ">." + tags + " * " + quantity.toString();
	}else if (tags){
		returning = "<" + item + ">." + tags;
	}else if (quantity && quantity !=1){
 		returning = "<" + item + "> * " + quantity.toString();
 	}else{
		returning = "<" + item + ">";
	}
	return returning;
}

/* A pretty simple wrapper for fs. Just because calling the whole function is an hassle everytime */
export class fs {
  private static fls = require('fs');
	static wrtFile(file: string, content: string) {
		this.fls.writeFileSync(file, content);
	}
	static rdFile(file: string) {
		return this.fls.readFileSync(file, "utf8");
	}
}

/* Item class. Pretty simple, an item that could have tags and a quantity.*/
export class Item {
	itemName: string;
	additionalTags: string;
	constructor(itemName: string, additionalTags?:string){
		this.itemName = itemName;
		this.additionalTags = additionalTags;
	}
	/* tweakerize(x) just gives you back a minetweaker string of X of this Item */
	tweakerize(quantity?: number): string{
		return turnToMinetweakerFormat(this.itemName, quantity, this.additionalTags);
	}
}

/* This is literally the Null item */
export class NullItem extends Item{
	constructor(){
		super(null);
	}
	tweakerize(): string{
		return turnToMinetweakerFormat();
	}
}


/* This is where the magic happens. It's also the longest class of the library. */
export class Script {
	name: string; // This name is gonna become the filename. Choose wisely.
	code: Array<string>; // This array is just all the rows of code.
	
	/* Takes the name as an argument */
	constructor(a: string){
		this.name = a + ".zs";
		this.code = ["//Script created with MTweakerTS"];
	}

	/* Returns the whole code, as a single string. */
	returnCode(): string{
		let returned = this.code.join("\n"); // Joining the code together
		return returned;
	}

	/* This function outputs to a file in the same folder. You can output to files in subfolders by giving the script a path as the name */
	output(): void{
		fs.wrtFile(this.name, this.returnCode());
		console.log("Created " + this.name + "! Have fun.")
  	}
	
	/* Adds a row to the script. */
	addToCode(a: string): void{
		this.code[this.code.length] = a;
	}

	/* Imports a function*/
	include(a: string): void{
		let imported = a.split(".").reverse()[0];
		this.addToCode("//Importing " + imported + "\nimport " + a + ";");
	}
	
	/* THE NEXT FUNCTIONS ALL ADD TO THE SCRIPT */
	print(a: string): void{
		this.addToCode("print(" + a + ");");
	}

	/* Adds a shaped recipe. */
	addShapedRecipe(out: [Item, number], inp: Array<Array<Item>>){
		var input:Array<Array<Item>> = inp;
		var fastTweakerize = x => x.tweakerize(); // Using arrow notation because it's elegant.
		var inputString:Array<Array<string>> = input.map(subinput => subinput.map(fastTweakerize));
		this.addToCode("recipes.addShaped(" + out[0].tweakerize(out[1]) + ", " + JSON.stringify(inputString) + ");");
	}

	/* Removes a shaped recipe */
	removeRecipe(a: string){
		this.addToCode("recipes.remove(<" + a + ">);");
	}

	/* Adds a shapeless recipe */
	addShapelessRecipe(out: Item, inp: Array<Item>){
		var fastTweakerize = x => x.tweakerize();
		var inputString:Array<string> = inp.map(fastTweakerize);
		this.addToCode("recipes.addShapeless(" + out.tweakerize() + ", " + JSON.stringify(inputString) + ");");
	}
	
	/* Adds a smelting recipe */
	addSmeltingRecipe(inp: string, out: Item){
		this.addToCode("furnace.addRecipe(" + out.tweakerize() +", " + turnToMinetweakerFormat(inp) + ");");
	}
  	
	/* Removes a smelting recipe by output */
	removeSmeltingByOut(out: Item){
		var removed: Item = new Item(out.itemName);	
    		this.addToCode("furnace.remove(" + removed.tweakerize() + ");");
	}

	/* Removes a smelting recipe by input */
	removeSmeltingByIn(inp: Item){
		var removed: Item = new Item(inp.itemName);
		this.addToCode("furnace.remove(<*>, " + removed.tweakerize() + ");");
	}
}

var a = new Item("minecraft:apple");
var nll = new NullItem();
var b = new Script("prova");
b.addShapelessRecipe(a, [a, a, a, a, nll, a, a, a, a]);
b.output();
 /* END GENERAL LIBRARY */
