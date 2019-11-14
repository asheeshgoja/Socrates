import { Component, OnInit } from '@angular/core';
import { Socket } from 'ngx-socket-io';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {

  inputText: string = 'Clips Response';
  outputText: string = '';
  choices = [];
  choices_list: string = null;
  range = null;
  selectedRange: string = null;
  results = null;
  choices_selectbox = null;
  validInput: boolean = false;
  matchFactors = [];
  questionAnswers = [];

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
        this.choices_selectbox = null;
        this.inputText = match_choice[1];
        this.choices = match_choice[2].split(' ');
        this.range = null;
      }

      if (match_range != null) {
        this.inputText = match_range[1];
        let rngArr = match_range[2].split(' ');
        this.range = { min: parseInt(rngArr[0]), max: parseInt(rngArr[1]) }
        this.choices = null;
        this.selectedRange = null;
      }



      if (response.includes('~.')) {
        let arr = response.split('~.');

        arr.forEach(e => {
          let regex_results = /.*'(.*)'.*getting married is (.*) % and.*single is (.*) %/;
          var match_results = regex_results.exec(e);
          if (match_results != null) {
            this.results = { factor: match_results[1], married: match_results[2], not_married: match_results[3] }
          }

          let regex_factor = /Factor (.*),.*rating:(.*) %/;
          var match_factor = regex_factor.exec(e);
          if (match_factor != null) {
            this.matchFactors.push({ factor: match_factor[1], value: match_factor[2] });
          }

          let regex_qna = /QUESTION: (.*)\?\..*ANSWER:(.*)/;
          e = e.replace('~CLIPS>', "");
          var match_qna = regex_qna.exec(e);
          if (match_qna != null) {
            this.questionAnswers.push({ question: match_qna[1], answer: match_qna[2] });
          }

        });
      }

      this.outputText = response;
    });
  }


  resetClicked(e) {
    this.results = null;
    let name = `user-${new Date().getTime()}`;
    this.socket.emit('start_clips', name);
  }

  onChoicesListChange(e) {
    this.socket.emit('user_response', e.target.value);
  }

  onInputTextChange(e) {
    let v = parseInt(this.selectedRange);

    if (this.range.min <= v && this.range.max >= v) {
      this.validInput = true;
    } else {
      this.validInput = false;
    }
  }

  onSendInput(e) {
    this.socket.emit('user_response', this.selectedRange);
  }

 
}
