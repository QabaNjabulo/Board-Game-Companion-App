import { Component, OnInit, HostListener, ViewChild, Renderer2, ElementRef } from '@angular/core';
import { EditorBodyComponent } from '../editor-body/editor-body.component';
import { EditorConsoleComponent } from '../editor-console/editor-console.component';
import { EditorStatusBarComponent } from '../editor-status-bar/editor-status-bar.component';
import { empty, script } from '../../shared/models/script';
import { ScriptService } from '../../shared/services/scripts/script.service';
import { ActivatedRoute, Router } from '@angular/router';
import { find } from '../../shared/models/find';
import { replace } from '../../shared/models/replace';
import { EditorSideBarComponent } from '../editor-side-bar/editor-side-bar.component';
import { neuralnetwork } from '../../shared/models/neuralnetwork';
import * as tf from '@tensorflow/tfjs'
import { inputParameters } from '../../shared/models/inputParameters';
import { entity } from '../../shared/models/entity';
import { selection } from '../../shared/models/selection';
import { Ace } from 'ace-builds';

interface message{
  message: string;
  class: string;
}

@Component({
  selector: 'board-game-companion-app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss'],
})
export class EditorComponent implements OnInit{
  toolBarHeight = 35;
  sideBarWidth = 180;
  sideBarHeight = 0;
  statusBarHeight = 25;
  screenWidth = 0;
  screenHeight = 0;
  consoleWidth = 0;
  consoleHeight = 150;
  bodyHeight = 0;
  bodyWidth = 0;
  messages:message[] = [];
  @ViewChild(EditorBodyComponent,{static:true}) editorCode: EditorBodyComponent = new EditorBodyComponent(this.scriptService);
  @ViewChild(EditorConsoleComponent,{static:true}) editorConsole: EditorConsoleComponent = new EditorConsoleComponent();
  @ViewChild(EditorStatusBarComponent,{static:true}) editorStatusBar: EditorStatusBarComponent = new EditorStatusBarComponent();
  @ViewChild(EditorBodyComponent,{static:true}) editorBody: EditorBodyComponent = new EditorBodyComponent(this.scriptService);
  @ViewChild(EditorSideBarComponent,{static:true}) editorSideBar: EditorSideBarComponent = new EditorSideBarComponent();
  currentScript:script = empty;
  location = "https://board-game-companion-app.s3.amazonaws.com/development/scripts/test/file.js";
  showInput = false;
  inputBlock = false;
  inputResult:any[] = [];
  parameters:inputParameters[] = [];
  statusMessages:string[] = [];
  programStructure!:entity;

  constructor(private readonly scriptService:ScriptService, private router: Router){
    this.currentScript = this.router.getCurrentNavigation()?.extras.state?.['value'];
  }

  ngOnInit(): void {
    
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.updateDimensions();

    this.parameters.push({
      prompt:"Enter name",
      type:"text"
    })
    
    this.parameters.push({
      prompt:"Enter position",
      type:"number"
    })

    this.parameters.push({
      prompt:"choose",
      type:"option",
      options:["left","middle","right","top","bottom"]
    })

    

    document.dispatchEvent(new Event('editor-page'));
  }


  @HostListener('window:resize', ['$event'])
  onScreenResize(): void{
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
    this.updateDimensions();
  }

  updateDimensions(): void{
    this.sideBarHeight = this.screenHeight - this.toolBarHeight - this.statusBarHeight;
    this.consoleWidth = this.screenWidth - this.sideBarWidth;
    this.bodyHeight = this.screenHeight - this.toolBarHeight - this.statusBarHeight - this.consoleHeight;
    this.bodyWidth = this.screenWidth - this.sideBarWidth;
  }

  updateConsoleHeight(height:number):void{
    this.consoleHeight = height;
    this.updateDimensions();
    window.setTimeout(()=>{
      this.editorBody.ngOnInit();
    },250);
  }



  async neuralnetworks():Promise<any>{
    
    const modelsInfo = localStorage.getItem("models");
    const result = new Object();

    if(modelsInfo === null)
      return null;
    else{
      const networks:neuralnetwork[] = JSON.parse(modelsInfo);
      const models:{name:string,model:tf.LayersModel,min:number[],max:number[],labels:string[]}[] = [];
      
      for(let count = 0; count < networks.length; count++){
        models.push({
          name: networks[count].name,
          model: await tf.loadLayersModel('localstorage://' + networks[count].name),
          min: networks[count].min as number[],
          max: networks[count].max as number[],
          labels: networks[count].labels as string[]
        })
      }

      return ((name:string,input:number[])=>{
        
        let index = -1;

        for(let count = 0; count < models.length && index === -1; count++){
          if(models[count].name === name)
            index = count;
        }

        if(index === -1)
          return "";

        
        const inputTensor = tf.tensor2d(input,[1,input.length]);
        const normalizedInput = inputTensor.sub(models[index].min).div(models[index].max).sub(models[index].min);
        const tensorResult = models[index].model.predict(normalizedInput) as tf.Tensor;
        tensorResult.print();
        index = Array.from(tf.argMax(tensorResult,1).dataSync())[0];
        return models[index].labels[index];
      })

      
    }

    return result;
  }

  changeTheme():void{
    const theme = localStorage.getItem("board-game-companion-script-editor-theme");

    if(theme !== null)
      this.editorCode.codeEditor.setTheme("ace/theme/" + theme.toLowerCase());
  }

  input(){
    return (async(prompt:string,type:string,options?:string[])=>{
      this.inputBlock = true;
      this.showInput = true;
      this.parameters = [{
        prompt:prompt,
        type:type,
        options:options
      }]
  
      const pause = new Promise((resolve)=>{
        const interval = setInterval(()=>{
            if(!this.inputBlock){
                clearInterval(interval);
                resolve("Okay");
            }
        },10);
      });
  
      await pause;
  
      return this.inputResult[0];
    })
  }


  inputGroup(){
    return (async(parameters:inputParameters[])=>{
      console.log(parameters);
      
      this.inputBlock = true;
      this.showInput = true;
      this.parameters = parameters;
  
      const pause = new Promise((resolve)=>{
        const interval = setInterval(()=>{
            if(!this.inputBlock){
                clearInterval(interval);
                resolve("Okay");
            }
        },10);
      });
  
      await pause;
  
      return this.inputResult;
    })
  }

  submitInput(value:any[]): void{
    this.inputResult = value;
    this.showInput = false;
    this.inputBlock = false;
  }


  async execute(): Promise<void>{
    
    this.editorConsole.open();

    try{
      const console = this.editorConsole.defineConsole();
      const model = await this.neuralnetworks();
      const input = this.input();
      const inputGroup = this.inputGroup();
      this.editorConsole.clear();
      // const code = new Function("console","model","input","inputGroup",this.editorBody.getCode());
      // code(console,model,input,inputGroup);
      this.scriptService.getFileData(this.currentScript.build.location).subscribe({
        next:(value)=>{
          console.log(value)

          const code = new Function("console","model","input","inputGroup",value);
          code(console,model,input,inputGroup);
        },
        error:(e)=>{
          console.log(e);
        }
      });
    }catch(err){
      //console.log(err);
    }

  }

  changesTracker(value:number): void{
    this.editorStatusBar.updateStatusOfChanges(value);
  }

  setProgramStructure(value:entity): void{
    this.programStructure = value;
    this.currentScript.programStructure = value;
  }

  undo(): void{
    this.editorBody.undo();
  }

  redo(): void{
    this.editorBody.redo();
  }

  copy(): void{
    this.editorBody.copy();
  }

  paste(): void{
    this.editorBody.paste();
  }

  cut(): void{
    this.editorBody.cut();
  }

  find(value:find): void{
    this.editorBody.find(value);
  }

  findNext(): void{
    this.editorBody.findNext();
  }

  findPrevious(): void{
    this.editorBody.findPrevious(); 
  }

  replace(value:replace): void{
    this.editorBody.replace(value);
  }

  replaceAll(value:replace): void{
    this.editorBody.replaceAll(value);
  }

  sideBarResize(value:number): void{
    if(value <= this.editorSideBar.getMaxWidth()){
      this.sideBarWidth = value;
      this.updateDimensions();
    }
  }

  toggleSideBar(value:boolean): void{
    if(value){
      this.editorSideBar.open();
    }else{
      this.editorSideBar.close();
    }
  }

  toggleConsole(value:boolean): void{
    if(value){
      this.editorConsole.open();
    }else{
      this.editorConsole.close();
    }
  }

  newMessage(message:string): void{
    this.statusMessages = [];
    this.statusMessages.push(message);
  }

  printStatusMessages(): void{
    for(let count = 0; count < this.statusMessages.length; count++)
      this.editorConsole.print({output:true,outputMessage:this.statusMessages[count]});
  }

  highlight(value:selection): void{
    this.editorBody.highlight(value);
  }

  remove(value:selection): void{
    this.editorBody.remove(value);
  }

  cursorChange(value:Ace.Point): void{
    this.editorSideBar.cursorChange(value);
  }

}
