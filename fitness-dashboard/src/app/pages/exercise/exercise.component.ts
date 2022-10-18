import {Component, OnDestroy, OnInit} from '@angular/core';
import {faMinusCircle, faPlusCircle} from '@fortawesome/free-solid-svg-icons';
import {FormBuilder, Validators} from '@angular/forms';
import {combineLatest, Subject} from 'rxjs';
import {map, switchMap, take, takeUntil, tap} from 'rxjs/operators';
import {UserService} from '../../services/user.service';
import {ExerciseService} from '../../services/exercise.service';

@Component({
  selector: 'app-exercise',
  templateUrl: './exercise.component.html',
  styleUrls: ['./exercise.component.scss'],
})
export class ExerciseComponent implements OnInit, OnDestroy {

  public addIcon = faPlusCircle;
  public removeIcon = faMinusCircle;
  public exerciseOptions = [];
  // Hard coded value- it must be replaced by value from database later
  private userWeight$ = this.userService.user$.pipe(
    map(userData => userData.weight)
  );

  public exerciseData = [
    '"Cycling, mountain bike, bmx",1.75072971940299',
    '"Cycling, <10 mph, leisure bicycling",0.823235629850746',
    '"Cycling, >20 mph, racing",3.29497352835821',
    '"Cycling, 10-11.9 mph, light",1.23485344477612',
    '"Cycling, 12-13.9 mph, moderate",1.64782526567164',
    '"Cycling, 14-15.9 mph, vigorous",2.05944308059702',
    '"Cycling, 16-19 mph, very fast, racing",2.47106089552239',
    '"Stationary cycling, very light",0.61742672238806',
    '"Stationary cycling, light",1.13262599402985',
    '"Stationary cycling, moderate",1.44133935522388',
    '"Stationary cycling, vigorous",2.16234753432836',
    '"Stationary cycling, very vigorous",2.57464235223881',
    '"Calisthenics, vigorous, pushups, situps…",1.64782526567164',
    '"Calisthenics, light",0.721008179104478',
    '"Circuit training, minimal rest",1.64782526567164',
    '"Weight lifting, body building, vigorous",1.23485344477612',
    '"Weight lifting, light workout",0.61742672238806',
    '"Health club exercise",1.13262599402985',
    '"Stair machine",1.85295717014925',
    '"Rowing machine, light",0.721008179104478',
    '"Rowing machine, moderate",1.44133935522388',
    '"Rowing machine, vigorous",1.75072971940299',
    '"Rowing machine, very vigorous",2.47106089552239',
    '"Ski machine",1.44133935522388',
    '"Aerobics, low impact",1.02972154029851',
    '"Aerobics, high impact",1.44133935522388',
    '"Aerobics, step aerobics",1.75072971940299',
    '"Aerobics, general",1.33843490149254',
    '"Stretching, hatha yoga",0.823235629850746',
    '"Mild stretching",0.515199271641791',
    '"Water aerobics",0.823235629850746',
    '"Ballet, twist, jazz, tap",0.927494089552239',
    '"Ballroom dancing, slow",0.61742672238806',
    '"Ballroom dancing, fast",1.13262599402985',
    '"Running, 5 mph (12 minute mile)",1.64782526567164',
    '"Running, 5.2 mph (11.5 minute mile)",1.85295717014925',
    '"Running, 6 mph (10 min mile)",2.05944308059702',
    '"Running, 6.7 mph (9 min mile)",2.2652519880597',
    '"Running, 7 mph (8.5 min mile)",2.36815644179104',
    '"Running, 7.5mph (8 min mile)",2.57464235223881',
    '"Running, 8 mph (7.5 min mile)",2.77977425671642',
    '"Running, 8.6 mph (7 min mile)",2.88267871044776',
    '"Running, 9 mph (6.5 min mile)",3.08916462089552',
    '"Running, 10 mph (6 min mile)",3.29497352835821',
    '"Running, 10.9 mph (5.5 min mile)",3.70659134328358',
    '"Running, cross country",1.85295717014925',
    '"Running, general",1.64782526567164',
    '"Running, on a track, team practice",2.05944308059702',
    '"Running, stairs, up",3.08916462089552',
    '"Track and field (shot, discus)",0.823235629850746',
    '"Track and field (high jump, pole vault)",1.23485344477612',
    '"Track and field (hurdles)",2.05944308059702',
    '"Archery",0.721008179104478',
    '"Badminton",0.927494089552239',
    '"Basketball game, competitive",1.64782526567164',
    '"Playing basketball, non game",1.23485344477612',
    '"Boxing, in ring",2.47106089552239',
    '"Boxing, punching bag",1.23485344477612',
    '"Boxing, sparring",1.85295717014925',
    '"Cricket (batting, bowling)",1.02972154029851',
    '"Croquet",0.515199271641791',
    '"Curling",0.823235629850746',
    '"Frisbee playing, general",0.61742672238806',
    '"Frisbee, ultimate frisbee",1.64782526567164',
    '"Golf, general",0.927494089552239',
    '"Golf, walking and carrying clubs",0.927494089552239',
    '"Golf, driving range",0.61742672238806',
    '"Golf, miniature golf",0.61742672238806',
    '"Golf, walking and pulling clubs",0.885519904477612',
    '"Golf, using power cart",0.721008179104478',
    '"Gymnastics",0.823235629850746',
    '"Hacky sack",0.823235629850746',
    '"Handball",2.47106089552239',
    '"Handball, team",1.64782526567164',
    '"Hockey, field hockey",1.64782526567164',
    '"Hockey, ice hockey",1.64782526567164',
    '"Riding a horse, general",0.823235629850746',
    '"Horesback riding, saddling horse",0.721008179104478',
    '"Horseback riding, grooming horse",0.721008179104478',
    '"Horseback riding, trotting",1.33843490149254',
    '"Horseback riding, walking",0.515199271641791',
    '"Horse racing, galloping",1.64782526567164',
    '"Horseshoe pitching",0.61742672238806',
    '"Martial arts, judo, karate, jujitsu",2.05944308059702',
    '"Martial arts, kick boxing",2.05944308059702',
    '"Martial arts, tae kwan do",2.05944308059702',
    '"Krav maga training",2.05944308059702',
    '"Juggling",0.823235629850746',
    '"Kickball",1.44133935522388',
    '"Lacrosse",1.64782526567164',
    '"Orienteering",1.85295717014925',
    '"Playing paddleball",1.23485344477612',
    '"Paddleball, competitive",2.05944308059702',
    '"Polo",1.64782526567164',
    '"Racquetball, competitive",2.05944308059702',
    '"Playing racquetball",1.44133935522388',
    '"Rock climbing, ascending rock",2.2652519880597',
    '"Rock climbing, rappelling",1.64782526567164',
    '"Jumping rope, fast",2.47106089552239',
    '"Jumping rope, moderate",2.05944308059702',
    '"Jumping rope, slow",1.64782526567164',
    '"Rugby",2.05944308059702',
    '"Skateboarding",1.02972154029851',
    '"Roller skating",1.44133935522388',
    '"Roller blading, in-line skating",2.47106089552239',
    '"Soccer, competitive",2.05944308059702',
    '"Playing soccer",1.44133935522388',
    '"Softball or baseball",1.02972154029851',
    '"Softball, officiating",0.823235629850746',
    '"Softball, pitching",1.23485344477612',
    '"Squash",2.47106089552239',
    '"Table tennis, ping pong",0.823235629850746',
    '"Tai chi",0.823235629850746',
    '"Playing tennis",1.44133935522388',
    '"Tennis, doubles",1.23485344477612',
    '"Tennis, singles",1.64782526567164',
    '"Trampoline",0.721008179104478',
    '"Volleyball, competitive",1.64782526567164',
    '"Playing volleyball",0.61742672238806',
    '"Volleyball, beach",1.64782526567164',
    '"Wrestling",1.23485344477612',
    '"Backpacking, Hiking with pack",1.44133935522388',
    '"Carrying 16 to 24 lbs, upstairs",1.23485344477612',
    '"Carrying 25 to 49 lbs, upstairs",1.64782526567164',
    '"Climbing hills, carrying up to 9 lbs",1.44133935522388',
    '"Climbing hills, carrying 10 to 20 lb",1.5449208119403',
    '"Climbing hills, carrying 21 to 42 lb",1.64782526567164',
    '"Climbing hills, carrying over 42 lb",1.85295717014925',
    '"Hiking, cross country",1.23485344477612',
    '"Marching, rapidly, military",1.33843490149254',
    '"Children\'s games, hopscotch, dodgeball",1.02972154029851',
    '"Race walking",1.33843490149254',
    '"Rock climbing, mountain climbing",1.64782526567164',
    '"Walking, under 2.0 mph, very slow",0.411617814925373',
    '"Walking 2.0 mph, slow",0.515199271641791',
    '"Walking 2.5 mph",0.61742672238806',
    '"Walking 3.0 mph, moderate",0.679710997014925',
    '"Walking 3.5 mph, brisk pace",0.782615450746269',
    '"Walking 3.5 mph, uphill",1.23485344477612',
    '"Walking 4.0 mph, very brisk",1.02972154029851',
    '"Walking 4.5 mph",1.29713771940299',
    '"Walking 5.0 mph",1.64782526567164',
    '"Canoeing, camping trip",0.823235629850746',
    '"Canoeing, rowing, light",0.61742672238806',
    '"Canoeing, rowing, moderate",1.44133935522388',
    '"Canoeing, rowing, vigorous",2.47106089552239',
    '"Crew, sculling, rowing, competition",2.47106089552239',
    '"Kayaking",1.02972154029851',
    '"Paddle boat",0.823235629850746',
    '"Windsurfing, sailing",0.61742672238806',
    '"Sailing, competition",1.02972154029851',
    '"Sailing, yachting, ocean sailing",0.61742672238806',
    '"Skiing, water skiing",1.23485344477612',
    '"Ski mobiling",1.44133935522388',
    '"Skin diving, fast",3.29497352835821',
    '"Skin diving, moderate",2.57464235223881',
    '"Skin diving, scuba diving",1.44133935522388',
    '"Snorkeling",1.02972154029851',
    '"Surfing, body surfing or board surfing",0.61742672238806',
    '"Whitewater rafting, kayaking, canoeing",1.02972154029851',
    '"Swimming laps, freestyle, fast",2.05944308059702',
    '"Swimming laps, freestyle, slow",1.44133935522388',
    '"Swimming backstroke",1.44133935522388',
    '"Swimming breaststroke",2.05944308059702',
    '"Swimming butterfly",2.2652519880597',
    '"Swimming leisurely, not laps",1.23485344477612',
    '"Swimming sidestroke",1.64782526567164',
    '"Swimming synchronized",1.64782526567164',
    '"Swimming, treading water, fast, vigorous",2.05944308059702',
    '"Swimming, treading water, moderate",0.823235629850746',
    '"Water aerobics, water calisthenics",0.823235629850746',
    '"Water polo",2.05944308059702',
    '"Water volleyball",0.61742672238806',
    '"Water jogging",1.64782526567164',
    '"Diving, springboard or platform",0.61742672238806',
    '"Ice skating, < 9 mph",1.13262599402985',
    '"Ice skating, average speed",1.44133935522388',
    '"Ice skating, rapidly",1.85295717014925',
    '"Speed skating, ice, competitive",3.08916462089552',
    '"Cross country snow skiing, slow",1.44133935522388',
    '"Cross country skiing, moderate",1.64782526567164',
    '"Cross country skiing, vigorous",1.85295717014925',
    '"Cross country skiing, racing",2.88267871044776',
    '"Cross country skiing, uphill",3.39787798208955',
    '"Snow skiing, downhill skiing, light",1.02972154029851',
    '"Downhill snow skiing, moderate",1.23485344477612',
    '"Downhill snow skiing, racing",1.64782526567164',
  ];
  private componentDestruction$ = new Subject();

  public mainFormGroup = this.fb.group({
    exercise_name: [null, Validators.required],
    duration: [null],
    calories: [null, Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    public userService: UserService,
    public exerciseService: ExerciseService,
  ) { }

  public addExerciseItem() {
    if (!this.mainFormGroup.valid) { this.mainFormGroup.markAllAsTouched(); return; }
    const exerciseItem = this.mainFormGroup.getRawValue();
    this.mainFormGroup.get('exercise_name').reset();
    this.mainFormGroup.get('duration').reset();
    this.mainFormGroup.get('calories').reset();
    this.exerciseService.saveExerciseItem(exerciseItem).pipe(
      switchMap(exerciseItems => this.userService.saveCaloriesBurned(exerciseItems)),
    ).subscribe(() => {});
  }

  public removeExerciseItem(itemID) {
    this.exerciseService.deleteExerciseItem(itemID).pipe(
      switchMap(exerciseItems => this.userService.saveCaloriesBurned(exerciseItems)),
    ).subscribe();
  }

  ngOnInit() {
    this.exerciseData.forEach(exercise => {
      const splitExerciseData = exercise.split('"');
      const formattedExercise = {
        value: splitExerciseData[1],
        caloriesPerLbPerHalfHour: splitExerciseData[2].slice(1 , splitExerciseData[2].length)
      };
      this.exerciseOptions.push(formattedExercise);
    });

    combineLatest([
      this.mainFormGroup.get('exercise_name').valueChanges,
      this.mainFormGroup.get('duration').valueChanges,
      this.userWeight$,
    ]).pipe(
      takeUntil(this.componentDestruction$),
    ).subscribe(([exercise, duration, userWeight]) => {
      if (!exercise || !userWeight || !duration || duration < 0) { return; }
      const foundExercise = this.exerciseOptions.find(e => e.value.toLowerCase().includes(exercise.toLowerCase()));
      if (!!foundExercise) {
        // Still not sure about this, the dataset just seems to be wrong/inconsistent with itself.
        // It says units are measured in calories burned/per kg/per hour, but when calculated it seems that
        // The numbers are closer to calories burned/per lb/per half hour. Might be missing something, but I don't think I am
        let caloriesBurned = foundExercise.caloriesPerLbPerHalfHour * (userWeight * 2.2) * (duration / 30);
        caloriesBurned = Math.round(caloriesBurned / 10) * 10;
        this.mainFormGroup.get('calories').setValue(caloriesBurned);
      } else {
        this.mainFormGroup.get('calories').reset();
      }
    });
  }

  ngOnDestroy() {
    this.componentDestruction$.next();
  }

}
