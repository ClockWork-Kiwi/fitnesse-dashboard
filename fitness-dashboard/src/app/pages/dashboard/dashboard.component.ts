import { Component, OnInit } from '@angular/core';
import {Chart} from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  private dummyWeekData = [
    {
      date: '2022-10-03',
      calories_consumed: 2000,
      calories_burned: 250,
      calories_allowed: 2000,
    },
    {
      date: '2022-10-04',
      calories_consumed: 1800,
      calories_burned: 500,
      calories_allowed: 2000,
    },
    {
      date: '2022-10-05',
      calories_consumed: 2300,
      calories_burned: 0,
      calories_allowed: 2000,
    },
    {
      date: '2022-10-06',
      calories_consumed: 1500,
      calories_burned: 1000,
      calories_allowed: 2000,
    },
    {
      date: '2022-10-07',
      calories_consumed: 3000,
      calories_burned: 0,
      calories_allowed: 2000,
    },
    {
      date: '2022-10-08',
      calories_consumed: 2100,
      calories_burned: 100,
      calories_allowed: 2000,
    },
    {
      date: '2022-10-09',
      calories_consumed: 2000,
      calories_burned: 250,
      calories_allowed: 2000,
    },
  ];

  constructor() { }

  private initWeekGraph() {

    const context = document.getElementById('thisWeekChart') as any;
    const consumedData = {
      label: 'Consumed',
      data: [],
      backgroundColor: 'rgba(255, 255, 255, 0.4)',
      borderColor: 'rgba(255, 255, 255, 1)',
      borderWidth: 2,
    };
    const burnedData = {
      label: 'Allowed',
      data: [],
      backgroundColor: 'rgba(152, 255, 194, 0.4)',
      borderColor: 'rgba(152, 255, 194, 1)',
      borderWidth: 2,
    };
    for (const day of this.dummyWeekData) {
      consumedData.data.push(day.calories_consumed);
      burnedData.data.push(day.calories_burned + day.calories_allowed);
    }
    const weekChart = new Chart(context, {
      type: 'bar',
      data: {
        labels: this.dummyWeekData.map(data => data.date),
        datasets: [consumedData, burnedData],
      },
      options: {
        scales: {
          y: {
            ticks: { color: 'green', beginAtZero: true }
          },
          x: {
            ticks: { color: 'red', beginAtZero: true }
          }
        }
      }
    });
  }

  ngOnInit() {
    this.initWeekGraph();
  }

}
