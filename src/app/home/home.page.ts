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
  results_image_source = null;
  results_caption = null;
  showGrid = false;
  showResponses = false;
  socketUUID: any = null;
  startEngine = false;
  resetButtonColor = 'red';
  resultsIconName = 'heart';
  resultsIconColor = 'red';
  greetings = '';

  constructor(private socket: Socket) {
  }


  ngOnInit(): void {
    this.socket.connect();

    this.socketUUID = `user-${new Date().getTime()}`;
    // this.currentUser = name;

    this.socket.emit('start_clips', this.socketUUID);

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



      if (response.includes('~#')) {
        let arr = response.split('~#');

        arr.forEach(e => {
          let regex_results = /.*'(.*)'.*getting married is (.*) % and.*single is (.*) %/;
          var match_results = regex_results.exec(e);
          if (match_results != null) {
            this.results = { confidence_factor: match_results[1], married: match_results[2], not_married: match_results[3] }
            let cf = this.results.confidence_factor;
            // cf = 'average';
            let succ_fac = Math.round(parseInt(this.results.married));
            let fail_fac = Math.round(parseInt(this.results.not_married));

            switch (cf) {
              case "extremely low":
                //this.results_image_source = "../assets/imgs/extremely low.jpg";
                this.resultsIconName = 'heart-dislike';
                this.resultsIconColor = 'white';
                this.greetings = 'Sympathies';
                this.results_caption = `Socrates Artificial Intelligence recommends that you not get married, as the likelyhood of a failed marriage is ${fail_fac} %`;
                break;
              case "low":
                // this.results_image_source = "../assets/imgs/low.png";
                this.greetings = 'Sympathies';
                this.resultsIconName = 'heart-empty';
                this.resultsIconColor = 'gray';
                this.results_caption = `Socrates Artificial Intelligence recommends that you not get married, as the likelyhood of a failed marriage is ${fail_fac} %`;
                break;
              case "average":
                this.greetings = 'Congratulations !!';
                // this.results_image_source = "../assets/imgs/average.jpg";
                this.resultsIconName = 'heart-half';
                this.resultsIconColor = 'green';
                this.results_caption = `Socrates Artificial Intelligence predicts that you have an average likelyhood of a successful marrige with a likelyhood of ${succ_fac} %`;
                break;
              case "high":
                  this.greetings = 'Congratulations !!';
                this.resultsIconName = 'heart';
                this.resultsIconColor = 'red';
                this.results_image_source = "../assets/imgs/high.jpg";
                this.results_caption = `Socrates Artificial Intelligence predicts that you will have a successful marriage with a likelyhood of ${succ_fac} %`;
                break;
              case "extremely high":
                this.resultsIconName = 'heart';
                this.resultsIconColor = 'red';
                this.results_image_source = "../assets/imgs/extremely high.jpg";
                this.results_caption = `Socrates Artificial Intelligence predicts that you will have a very successful marriage with a likelyhood of ${succ_fac} %`;
                break;
            }

            let p: any = { userid: this.socketUUID, sock_id: this.socket.ioSocket.id };
            this.socket.emit('close_session', "", p);
            this.resetButtonColor = 'chartreuse';
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
    this.socketUUID = `user-${new Date().getTime()}`;
    this.socket.emit('start_clips', this.socketUUID);
    this.showGrid = false;
    this.showResponses = false;
    this.startEngine = false;
    this.resetButtonColor = 'red';

  }

  onChoicesListChange(e) {
    let p: any = { userid: this.socketUUID, sock_id: this.socket.ioSocket.id };
    this.socket.emit('user_response', e.target.value, p);
  }

  validateResponse() {
    let v = parseInt(this.selectedRange);

    if (this.range.min <= v && this.range.max >= v) {
      document.getElementById("range_input").style.setProperty('color', 'green');
      return true;
    } else {
      document.getElementById("range_input").style.setProperty('color', 'red');
      return false;
    }
  }

  onInputTextChange(e) {
    this.validInput = this.validateResponse();
  }

  onSendInput(e) {
    let p: any = { userid: this.socketUUID, sock_id: this.socket.ioSocket.id };
    this.socket.emit('user_response', this.selectedRange, p);
  }

  keyupEnter() {
    if (this.validateResponse()) {
      let p: any = { userid: this.socketUUID, sock_id: this.socket.ioSocket.id };
      this.socket.emit('user_response', this.selectedRange, p);
    }
  }

  onShowReasoning(e) {
    this.showGrid = !this.showGrid
  }

  onShowResponses(e) {
    this.showResponses = !this.showResponses;
  }

  playClicked(e) {
    this.resetButtonColor = 'chartreuse';
    this.startEngine = true;
  }
}
