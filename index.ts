import { Configuration, OpenAIApi } from "openai";
import * as readline from "node:readline";
import * as fs from "node:fs";
import { stdin as input, stdout as output } from "node:process";
import dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({ input, output, prompt: ">" });
console.log("process.env.OPENAI_API_KEY", process.env.OPENAI_API_KEY);
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function main(input: string) {
  const [prompt, property, ...content] = input.split(" ");
  
  switch (prompt) {
    case "listEngines": {
      const listEngines = await openai.listEngines();
      listEngines.data.data.forEach((value) => console.log(value));
      break;
    }

    case "model": {
      const response = await openai.retrieveModel(property);
      console.log(response.data);
      break;
    }

    case "completion": {
      console.log(property, content.join( " "));
      const response = await openai.createCompletion({
        model: property,
        prompt: content.join(" "),
        max_tokens: 2047,
        temperature: 0,
      });
      console.log(response.data);
      break;
    }

    case "chatCompletion": {
      if (!content) {
        console.log("The content is required");
      }
      const completion = await openai.createChatCompletion({
        model: property,
        messages: [{role: "user", content: content.join("") }],
      });
      console.log(completion.data.choices[0].message);
      break;
    }

    case "edit": {
      const response = await openai.createEdit({
        model: property,
        input: "What day of the week is it?",
        instruction: "Fix the spelling mistakes",
      });
      console.log(response);
      break;
    }
    
    case "image": {
      const response = await openai.createImage({
        prompt: content.join(" "),
        n: Number(property),
        size: "1024x1024"
      });
      console.log(response);
      break;
    }

    // must be 256x256, 512x512, or 1024x1024
    case "imageEdit": {
      const [file,...rest] = content;
      const rester = await fs.readFileSync(file);
      const myBlob = new Blob([rester]);
      const data = new File([myBlob], property);
      const response = await openai.createImageEdit(
        data,
        property
      );
      console.log(response);
      break;
    }
  }
}

rl.prompt();

rl.on("line", (line) => {
  main(line.trim());
  rl.prompt();
}).on("close", () => {
  console.log("Have a great day!");
  process.exit(0);
});
