import {Component, OnDestroy, OnInit} from '@angular/core';
import {Chart} from 'chart.js';
import {UserService} from '../../services/user.service';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  private componentDestruction$ = new Subject();

  private weekChart;
  private todayChart;
  private weightChart;

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
  private dummyWeightData = [
    {
      date: '2022-10-03',
      weight: 91.5,
    },
    {
      date: '2022-10-04',
      weight: 91.3,
    },
    {
      date: '2022-10-05',
      weight: 91.3,
    },
    {
      date: '2022-10-06',
      weight: 91.4,
    },
    {
      date: '2022-10-07',
      weight: 91.1,
    },
    {
      date: '2022-10-08',
      weight: 91,
    },
    {
      date: '2022-10-09',
      weight: 91.1,
    },
  ];

  constructor(
    private userService: UserService,
  ) { }

  private initWeekGraph(data) {
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
    for (const day of data) {
      consumedData.data.push(day.calories_consumed);
      burnedData.data.push(day.calories_burned + day.calories_allowed);
    }
    this.weekChart = new Chart(context, {
      type: 'bar',
      data: {
        labels: data.map(e => {
          if (!e.date) { return 'No Data'; }
          return new Date(e.date).toDateString();
        }),
        datasets: [consumedData, burnedData],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontColor: 'white',
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              fontColor: 'white',
              beginAtZero: true
            }
          }],
          xAxes: [{
            ticks: {
              fontColor: 'white',
              beginAtZero: true
            }
          }],
        },
      }
    });
  }

  private initTodayGraph() {
    const context = document.getElementById('todayChart') as any;
    const chartLabels = ['Left Today', 'Consumed'];
    const todaysData = [{
      data: [300, 1700],
      backgroundColor: ['rgba(152, 255, 194, 0.4)', 'rgba(255, 255, 255, 0.4)'],
    }];
    const hasBeenDrawn = !!this.todayChart;
    this.todayChart = new Chart(context, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: todaysData,
      },
      options: {
        legend: { display: false }
      }
    });
  }

  private initWeightGraph() {
    const context = document.getElementById('weightChart') as any;
    this.weightChart = new Chart(context, {
      type: 'line',
      data: {
        labels: this.dummyWeightData.map(data => data.date),
        datasets: [
          {
            label: 'Weight',
            data: this.dummyWeightData.map(data => data.weight),
            borderColor: 'rgba(152, 255, 194, 0.4)',
            fill: false,
            tension: 0.1,
          }
        ],
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: 'Weight over time',
          fontColor: 'white',
          fontSize: 25,
        },
        scales: {
          yAxes: [{
            ticks: {
              fontColor: 'white',
            }
          }],
          xAxes: [{
            ticks: {
              fontColor: 'white',
            }
          }],
        },
      }
    });
  }

  ngOnInit() {
    this.userService.userCaloriesWeek$.pipe(
      takeUntil(this.componentDestruction$),
    ).subscribe(data => {
      this.initWeekGraph(data);
    });
    this.initTodayGraph();
    this.initWeightGraph();
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
