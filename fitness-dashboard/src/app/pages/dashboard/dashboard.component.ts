import {Component, OnDestroy, OnInit} from '@angular/core';
import {Chart} from 'chart.js';
import {UserService} from '../../services/user.service';
import {Subject} from 'rxjs';
import {filter, map, takeUntil} from 'rxjs/operators';
import {formatDate} from '../../functions/formatDate';

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

  public dailyCalories$;

  constructor(
    public userService: UserService,
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
        title: {
          display: true,
          text: 'Last 7 Days',
          fontColor: 'white',
          fontSize: 25,
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

  private initTodayGraph(data) {
    const context = document.getElementById('todayChart') as any;
    const chartLabels = ['Left Today', 'Consumed'];
    const caloriesLeft = data.calories_allowed + data.calories_burned - data.calories_consumed;
    const caloriesConsumed = data.calories_consumed;
    const todaysData = [{
      data: [caloriesLeft > 0 ? caloriesLeft : 0, caloriesConsumed],
      backgroundColor: ['rgba(152, 255, 194, 0.4)', caloriesLeft >= 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 131, 131, 0.4)'],
    }];
    this.todayChart = new Chart(context, {
      type: 'doughnut',
      data: {
        labels: chartLabels,
        datasets: todaysData,
      },
      options: {
        legend: { display: false },
      }
    });
  }

  private initWeightGraph(data) {
    const context = document.getElementById('weightChart') as any;
    this.weightChart = new Chart(context, {
      type: 'line',
      data: {
        labels: data.map(e => new Date(e.date).toDateString()),
        datasets: [
          {
            label: 'Weight',
            data: data.map(e => e.weight),
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
          text: 'Weight over Time',
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
      filter(data => !!data && data.length > 0),
    ).subscribe(data => {
      this.initWeekGraph(data);
      this.initTodayGraph(data[6]);
    });

    this.userService.userWeightOverTime$.pipe(
      takeUntil(this.componentDestruction$),
      filter(data => !!data && data.length > 0),
    ).subscribe(data => {
      this.initWeightGraph(data);
    });

    this.dailyCalories$ = this.userService.allUserCalories$.pipe(
      takeUntil(this.componentDestruction$),
      map(data => {
        if (!data || data.length === 0) { return []; }
        return data.map(row => {
          let dateString = new Date(row.date).toDateString();
          if (dateString === new Date().toDateString()) { dateString = 'Today'; }
          const calorieDifference = row.calories_allowed + row.calories_burned - row.calories_consumed;
          let calorieString;
          let textClass;
          if (calorieDifference > 0) {
            calorieString = calorieDifference + ' Under';
            textClass = 'text-secondary';
          } else if (calorieDifference === 0) {
            calorieString = ' Exactly Met';
            textClass = 'text-white';
          } else {
            calorieString = (calorieDifference * -1) + ' Over';
            textClass = 'text-danger';
          }
          return `<li class="ps-0 pe-3 py-1 d-flex ${textClass}">${dateString}<span class="ms-auto">${calorieString}</span></li>`;
        });
      }),
    );
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
