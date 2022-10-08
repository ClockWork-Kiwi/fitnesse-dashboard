import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FoodDataService {

  constructor(
    private http: HttpClient,
  ) {}

  public getFoodData(foodName) {
    let params = new HttpParams();
    params = params.append('app_id', 'f92465c5');
    params = params.append('app_key', '42f9db221d05efe28ac99772f01ea0c6');
    params = params.append('ingr', foodName);
    params = params.append('category', 'generic-foods');
    params = params.append('nutrition-type', 'logging');
    return this.http.get('https://api.edamam.com/api/food-database/v2/parser?', { params }).pipe(
      map((foodData: any) => {
        if (!!foodData && !!foodData.hints && foodData.hints.length > 0) {
          const foundFood = foodData.hints[0].food.nutrients as any;
          return {
            calories: foundFood.ENERC_KCAL,
            carbs: foundFood.CHOCDF,
            protein: foundFood.PROCNT,
            fat: foundFood.FAT,
          };
        }
      })
    );
  }
}
