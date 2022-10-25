import {Component, OnDestroy, OnInit} from '@angular/core';
import {Chart} from 'chart.js';
import {UserService} from '../../services/user.service';
import {Subject} from 'rxjs';
import {filter, map, takeUntil, tap} from 'rxjs/operators';
import {faCircleInfo} from '@fortawesome/free-solid-svg-icons';
import {roundNumber} from '../../functions/roundNumber';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  // Private & Public variables
  private componentDestruction$ = new Subject();

  private weekChart;
  private todayChart;
  private weightChart;

  public dailyCalories$;

  public infoIcon = faCircleInfo;

  constructor(
    public userService: UserService,
  ) { }

  // Function that initialises the bar graph that shows the user's progress over the past week
  // (Note that there are three separate graph functions, they cannot be separated since
  // each graph is a different type and requires slightly different configurations)
  private initWeekGraph(data) {
    // Get the html element to display this chart
    const context = document.getElementById('thisWeekChart') as any;
    // Create & configure the object that will hold the chart's data
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
    // For each day in the given data, add a pair of bars to the graph for that day's calories consumed/burned
    for (const day of data) {
      consumedData.data.push(day.calories_consumed);
      burnedData.data.push(day.calories_burned + day.calories_allowed);
    }
    // Create thhe chart
    this.weekChart = new Chart(context, {
      type: 'bar',
      // Data/labels for the chart
      data: {
        // Configures the X-axis labels to look nicer
        labels: data.map(e => {
          if (!e.date) { return '-'; }
          return new Date(e.date).toDateString();
        }),
        datasets: [consumedData, burnedData],
      },
      // Display options for the chart
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

  // Function that initializes the graph that shows the user's data for today
  private initTodayGraph(data) {
    // Get the html element to display this chart
    const context = document.getElementById('todayChart') as any;
    // Create the labels/data required to display the chart
    const chartLabels = ['Left Today', 'Consumed'];
    const caloriesLeft = data.calories_allowed + data.calories_burned - data.calories_consumed;
    const caloriesConsumed = data.calories_consumed;
    const todaysData = [{
      data: [caloriesLeft > 0 ? caloriesLeft : 0, caloriesConsumed],
      backgroundColor: ['rgba(152, 255, 194, 0.4)', caloriesLeft >= 0 ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 131, 131, 0.4)'],
    }];
    // Create the chart
    this.todayChart = new Chart(context, {
      type: 'doughnut',
      // Data/labels for the chart
      data: {
        labels: chartLabels,
        datasets: todaysData,
      },
      // Display options for the chart
      options: {
        legend: { display: false },
        tooltips: {
          callbacks: {
            // This adds a % symbol to the numbers shown when hovering over one of the chart's slices.
            label: ctx => chartLabels[ctx.index] + ': ' + roundNumber(todaysData[0].data[ctx.index]) + '%'
          }
        },
      }
    });
  }

  // Function that initializes the graph that shows the user's weight over time
  private initWeightGraph(data) {
    // Get the html element to display this chart
    const context = document.getElementById('weightChart') as any;
    // Create the chart
    this.weightChart = new Chart(context, {
      type: 'line',
      // Data/labels
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
      // Display options
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
    // Listen to the observable in the user service that supplies the user's calories over the week, once they become available
    this.userService.userCaloriesWeek$.pipe(
      takeUntil(this.componentDestruction$),
      filter(data => !!data && data.length > 0),
    ).subscribe(data => {
      // Create the week graph
      this.initWeekGraph(data);
      // Create today's graph, using the final day stored in the week object (is always today)
      this.initTodayGraph(data[6]);
    });

    // Listen to the observable in the user service that supplies the user's weight over time, once it becomes available
    this.userService.userWeightOverTime$.pipe(
      takeUntil(this.componentDestruction$),
      filter(data => !!data && data.length > 0),
    ).subscribe(data => {
      // Create the weight graph
      this.initWeightGraph(data);
    });

    // Initialize the public daily calories observable that outputs a html formatted list of user calorie history
    this.dailyCalories$ = this.userService.allUserCalories$.pipe(
      takeUntil(this.componentDestruction$),
      map(data => {
        // If no data exists, return an empty array
        if (!data || data.length === 0) { return []; }
        // Return a transformed version of the data, transformation logic below
        return data.map(row => {
          // For each row in the data:
          // Create the string to display the date
          let dateString = new Date(row.date).toDateString();
          if (dateString === new Date().toDateString()) { dateString = 'Today'; }
          // Calculate the difference in the user's calories consumed vs calories allowed
          const calorieDifference = roundNumber(row.calories_allowed + row.calories_burned - row.calories_consumed);
          // Set the content and color of the calorie portion of the string depending on whether the calorie difference is negative or positive
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
          // Add a html formatted list item to the output
          return `<li class="ps-0 pe-3 py-1 d-flex ${textClass}">${dateString}<span class="ms-auto">${calorieString}</span></li>`;
        });
      }),
      tap(() => {
        setTimeout(() => {
          // Once the list has data to show, wait one frame, then scroll to the bottom of the 'history' list
          const nutritionView = document.getElementsByClassName('calorieList')[0];
          nutritionView.scrollTop = nutritionView.scrollHeight;
        }, 0);
      })
    );
  }

  ngOnDestroy() {
    // Destroy charts and destroy any ongoing subscriptions
    if (!!this.weightChart) { this.weightChart.destroy(); }
    if (!!this.weekChart) { this.weekChart.destroy(); }
    if (!!this.todayChart) { this.todayChart.destroy(); }
    this.componentDestruction$.next();
  }

}
