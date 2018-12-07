// Copyright (c) 2018 Zekromaster
//
// GNU GENERAL PUBLIC LICENSE
//    Version 3, 29 June 2007
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

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
class fs {
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

export class Fluid {
	fluidName: string;
	constructor(fluidName){
		this.fluidName = fluidName;
	}
	tweakerize(quantity?: number): string{
		return turnToMinetweakerFormat(this.fluidName, quantity);
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
	addShapedRecipe(out: [Item, number], inp: Array<Array<Item>>): void{
		var fastTweakerize = x => x.tweakerize(); // Using arrow notation because it's elegant.
		var inputString:Array<Array<string>> = inp.map(entry => entry.map(fastTweakerize));
		this.addToCode("recipes.addShaped(" + out[0].tweakerize(out[1]) + ", " + JSON.stringify(inputString) + ");");
	}

	/* Removes a shaped recipe */
	removeRecipe(a: Item): void{
		this.addToCode("recipes.remove(" + turnToMinetweakerFormat(a.itemName) + ");");
	}

	/* Adds a shapeless recipe */
	addShapelessRecipe(out: [Item, number], inp: Array<Item>): void{
		var fastTweakerize = x => x.tweakerize();
		var inputString:Array<string> = inp.map(fastTweakerize);
		this.addToCode("recipes.addShapeless(" + out[0].tweakerize(out[1]) + ", " + JSON.stringify(inputString) + ");");
	}

	/* Adds a smelting recipe */
	addSmeltingRecipe(out: Item, inp: Item): void{
		this.addToCode("furnace.addRecipe(" + out.tweakerize() +", " + turnToMinetweakerFormat(inp.itemName) + ");");
	}

	/* Removes a smelting recipe by output */
	removeSmeltingByOut(out: Item): void{
		var removed: Item = new Item(out.itemName);
    		this.addToCode("furnace.remove(" + removed.tweakerize() + ");");
	}

	/* Removes a smelting recipe by input */
	removeSmeltingByIn(inp: Item): void{
		var removed: Item = new Item(inp.itemName);
		this.addToCode("furnace.remove(<*>, " + removed.tweakerize() + ");");
	}

	/* Adds a Casting Basin Recipe [TINKERS CONSTRUCT] */
	addBasinRecipe(out: Item, inp: [Fluid, number], ticks: number): void{
		this.addToCode("mods.tconstruct.Casting.addBasinRecipe(" + out.tweakerize() + ", " + inp[0].tweakerize(inp[1]) + "," + ticks + ");")
	}
	addBasinCastRecipe(out: Item, inp: [Fluid, number], cast: [Item, boolean], ticks: number): void{
		this.addToCode("mods.tconstruct.Casting.addBasinRecipe(" + out.tweakerize() + ", " + inp[0].tweakerize(inp[1]) + "," + cast[0].tweakerize() + ", " + cast[1] + ", " + ticks + ");");
	}

	/* Removes a Castin Basin Recipe [TINKERS CONSTRUCT] */
	removeBasinRecipe(out: Item){
		this.addToCode("mods.tconstruct.Casting.removeBasinRecipe(" + out.tweakerize() + ");")
	}

	/* Adds a Casting Table Recipe [TINKERS CONSTRUCT] */
	addCastingRecipe(out: Item, inp: [Fluid, number], ticks: number): void{
		this.addToCode("mods.tconstruct.Casting.addTableRecipe(" + out.tweakerize() + ", " + inp[0].tweakerize(inp[1]) + "," + ticks + ");")
	}
	addCastingCastRecipe(out: Item, inp: [Fluid, number], cast: [Item, boolean], ticks: number): void{
		this.addToCode("mods.tconstruct.Casting.addTableRecipe(" + out.tweakerize() + ", " + inp[0].tweakerize(inp[1]) + "," + cast[0].tweakerize() + ", " + cast[1] + ", " + ticks + ");");
	}

	/* Removes a Casting Table Recipe [TINKERS CONSTRUCT] */
	removeCastingRecipe(out: Item){
		this.addToCode("mods.tconstruct.Casting.removeTableRecipe(" + out.tweakerize() + ");")
	}

}

 /* END GENERAL LIBRARY */
