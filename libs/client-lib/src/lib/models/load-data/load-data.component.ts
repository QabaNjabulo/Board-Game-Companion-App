import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NotificationComponent } from '../../shared/components/notification/notification.component';
import { StorageService } from '../../shared/services/storage/storage.service';
import { feature } from '../../shared/models/neuralnetwork/feature';

@Component({
  selector: 'board-game-companion-app-load-data',
  templateUrl: './load-data.component.html',
  styleUrls: ['./load-data.component.scss'],
})
export class LoadDataComponent implements OnInit {
  trainingData = 80;
  data:any = null;
  dataStore:any = null;
  inputFeature = "";
  outputLabel = "";
  inputs:feature[] = []
  outputs:string[] = []
  analysis:string[] = [];
  @ViewChild(NotificationComponent,{static:true}) notifications: NotificationComponent = new NotificationComponent();
  @Output()checkEvent = new EventEmitter();

  constructor(private readonly storageService:StorageService){

  }

  ngOnInit(): void{
    this.trainingData = 80;
  }

  getDataStore(): any{
    return this.dataStore;
  } 

  getData(): any{
    return this.data;
  }

  getInputs(): feature[]{
    return this.inputs;
  }

  getOutputs(): string[]{
    return this.outputs;
  }

  getTrainingPercentage(): number{
    return this.trainingData;
  }

  loadData(value:any): void{
    this.data = this.dataStore = null;
    const reader = new FileReader();
    reader.readAsText(value.target.files[0]);
    const type = value.target.files[0].type;

   
   if(type === "text/csv"){
      reader.onload = (event)=>{
        if(event.target !== null){
          if(typeof(event.target.result) == "string"){
            let temp = null;

            if(event.target.result.indexOf("\r\n") !== -1)
              temp =  event.target.result.split("\r\n");
            else
              temp = event.target.result.split("\n");

            this.dataStore = this.data = temp.map((value:string) =>{
              const result:any[] = [];

              value.split(",").forEach((cell:string)=>{
                if(isNaN(parseFloat(cell)))
                  result.push(cell);
                else
                  result.push(parseFloat(cell));
              });

              return result;
            })

            this.checkEvent.emit();
          }else
            this.notifications.add({type:"danger",message:"Expecting " + value.target.files[0].name + " to contain string data but contains " + typeof(event.target.result)});
        }else
          this.notifications.add({type:"danger",message:"Something went wrong when loading csv file"});
      }
    }else
      this.notifications.add({type:"danger",message:`Unsupported file type '${type}'.`});
  }

  checkTrainingDataPercentage(): void{
    if(this.trainingData < 50)
      this.trainingData = 50;

    if(this.trainingData > 98)
      this.trainingData = 98
  }

  checkInputOnEnter(value:any): void{

    if(value.key === "Enter"){
      value?.preventDefault();
      this.addInputFeature();
    }
  }

  checkOutputOnEnter(value:any): void{
    
    if(value.key === "Enter"){
      value?.preventDefault();
      this.addOutputFeature();
    }
  }

  enumerate(x:number): number[]{
    const result:number[] = [];

    for(let count = 0; count < x; count++){
      result.push(count);
    }

    return result;
  }

  addInputFeature(): void{
    if(this.inputFeature !== ""){
      if(!this.alreadyExists(this.inputFeature)){
        this.inputs.push({value:this.inputFeature,minimum:0,maximum:1});
        this.checkEvent.emit();
      }else
        this.notifications.add({type:'warning',message:'Duplicate features not allowed.'});
      this.inputFeature = "";
    }else
      this.notifications.add({type:'warning',message:'Can not use empty feature.'});
  }

  alreadyExists(value:string): boolean{
    let result = false;

    for(let count = 0; count < this.inputs.length && !result; count++){
      if(this.inputs[count].value === value)
        result = true;
    }

    for(let count = 0; count < this.outputs.length && !result; count++){
      if(this.outputs[count] === value)
        result = true;
    }

    return result;
  }

  addOutputFeature(): void{
    if(this.outputLabel !== ""){
      if(!this.alreadyExists(this.outputLabel)){
        this.outputs = [];
        this.outputs.push(this.outputLabel);
        this.checkEvent.emit();
      }else
        this.notifications.add({type:'warning',message:'Duplicate labels not allowed.'});

      this.outputLabel = "";
    }else
    this.notifications.add({type:'warning',message:'Can not use empty label.'});
  }


  removeInput(value:string): void{
    const temp:feature[] = [];

    for(let count = 0; count < this.inputs.length; count++){
      if(value!== this.inputs[count].value)
        temp.push(this.inputs[count]);
    }

    this.inputs = temp;
    this.checkEvent.emit();    
  }

  removeLabel(value:string): void{
    const temp:string[] = [];

    for(let count = 0; count < this.outputs.length; count++){
      if(value!== this.outputs[count])
        temp.push(this.outputs[count]);
    }

    this.outputs = temp;
    this.checkEvent.emit();
  }

  preCheckData(): boolean{
    let result = true;

    if(this.dataStore === null){
      this.notifications.add({type:"danger",message:"No data provided."});
      result = false;
    }

    return result;
  }


  cleanCsvData(): void{
    this.data = [];
    const temp = this.inputs.map(value => value.value).concat(this.outputs).map(value => parseFloat(value));
    const max:number = Math.max(...temp);

    for(let count = 0; count < this.dataStore.length; count++){
      if(this.dataStore[count].length > max)
        this.data.push(this.dataStore[count]);
    }
  }

  analyse():void{
    this.analysis = [];
    
    if(this.preCheckData()){
      this.cleanCsvData();

      const removed = this.dataStore.length - this.data.length;
      this.analysis.push("Removed " + removed + " invalid data " + (removed === 1 ? "entry":"entries"))
      this.analysis.push("Total data: " + this.data.length.toString());
      this.analysis.push("Total trainings data: " + Math.ceil((this.trainingData / 100) * this.data.length));
      this.analysis.push("Total testing data: " + Math.floor(((100 - this.trainingData) / 100) * this.data.length));
    }
  }
}
