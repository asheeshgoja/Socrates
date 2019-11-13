import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  inputText: string = 'Clips Response';
  outputText: String = '';
  choices = [];
  choices_list: String = null;
  range = null;
  selectedRange: String = null;
  results = null;
  choices_selectbox = null;
  validInput : boolean = false;

  constructor(private socket: Socket) {
  }


  ngOnInit(): void {
    this.socket.connect();

    let name = `user-${new Date().getTime()}`;
    // this.currentUser = name;

    this.socket.emit('start_clips', name);

    this.socket.fromEvent('clips_response').subscribe(data => {
      // let user = data['user'];
      // var dd = JSON.parse(data);
      let response = data['response'];
      // response = response.replace(/(\r\n|\n|\r)/gm, "");
      response = response.replace(/[\r\n]+/gm, "");
      console.log(response);


      let regex_choice = /\[(.*)\]\((.*)\):/;
      let regex_range = /\[(.*)\]range-\((.*)\)/;
      let regex_results = /.*'(.*)'.*getting married is (.*) % and.*single is (.*) %~/;

      var match_choice = regex_choice.exec(response);
      var match_range = regex_range.exec(response);
      var match_results = regex_results.exec(response);

      if (match_choice != null) {
        this.choices_selectbox  = null;
        this.inputText = match_choice[1];
        this.choices = match_choice[2].split(' ');
        this.range = null;
      }

      if (match_range != null) {
        this.inputText = match_range[1];
        let rngArr = match_range[2].split(' ');
        this.range = { min: parseInt(rngArr[0]), max: parseInt(rngArr[1]) }
        this.choices = null;
      }


      if (match_results != null) {
        this.results = { factor: match_results[1], married: match_results[2], not_married: match_results[3] }
      }


      this.outputText = response;
      // if (data['event'] === 'left') {
      //   //this.showToast('User left: ' + user);
      // } else {
      //   //this.showToast('User joined: ' + user);
      // }
    });

    this.socket.fromEvent('message').subscribe(message => {
      //this.messages.push(message);
    });
  }


  resetClicked() {
    this.results = null;
    let name = `user-${new Date().getTime()}`;
    this.socket.emit('start_clips', name);
  }

  onChoicesListChange(e) {
    this.socket.emit('user_response', e.target.value);
  }

  // onRangeChange(e) {
  //   this.socket.emit('user_response', this.selectedRange);
  // }

  onInputTextChange(){
    let v = parseInt(this.selectedRange);

    if(this.range.min <= v &&  this.range.max >= v){
      this.validInput = true;
    }else{
      this.validInput = false;
    }
  }

  onSendInput(){
    this.socket.emit('user_response', this.selectedRange);
  }

}
