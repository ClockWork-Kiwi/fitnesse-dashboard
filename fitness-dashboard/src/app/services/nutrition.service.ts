import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NutritionService {

  constructor(
    private http: HttpClient,
  ) { }

  public getUserNutrition(userID) {
    return this.http.get(`api/nutrition/${userID}`);
  }

}
