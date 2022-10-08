import { Component, OnInit } from '@angular/core';
import {Chart, registerables} from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    const thisWeekContext = document.getElementById('thisWeekChart') as any;
    const thisWeekData = [
      {
        data: [500, 500],
      }
    ];
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const thisWeekChart = new Chart(thisWeekContext, {
      type: 'line',
      data: {
        labels: weekdays,
        datasets: thisWeekData
      }
    });

  }

}
