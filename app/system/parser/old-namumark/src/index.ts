import {Node,Parser} from "./parser";
import {Renderer} from "./renderer";
import {Token,Tokenizer} from "./tokenizer";

export {Node,Parser, Renderer, Token, Tokenizer};

export const tokenizer = new Tokenizer();
export const parser = new Parser();

export default function parse(str: string){
    const ast = parser.run(tokenizer.run(str.slice(0, 50000)))

    const string = str.slice(50000, 200000)
    if(string){
        ast.push(new Node('Literal', {value: string}));
    }

    return ast;
}