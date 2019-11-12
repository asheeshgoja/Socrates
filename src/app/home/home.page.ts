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
  choices_list : String = '';


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
      console.log(response);
      
      let regex = /\[(.*)\]\((.*)\):/ ;
      var match = regex.exec(response);

      if (match != null) {
        this.inputText = match[1];
        this.choices = match[2].split(' ');
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


  askClicked() {
    // alert(this.inputText)
    this.socket.emit('user_response', this.inputText);
  }

  onChoicesListChange(e){
    this.socket.emit('user_response',e.target.value);
  }

}
