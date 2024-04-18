import { environment } from '../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiService {
  constructor(private _client: HttpClient) {}

  private _baseUrl = environment.apiBaseUrl;

  public post(endpoint: string, payload: object) {
    let url = this._assembleUrl(endpoint);
    return this._client.post(url, payload, { observe: 'response' });
  }

  public get(endpoint: string) {
    let url = this._assembleUrl(endpoint);
    return this._client.get(url, { observe: 'response'});
  }

  private _assembleUrl(endpoint: string) {
    return endpoint == '/'
      ? this._baseUrl
      : endpoint.endsWith('/')
        ? this._baseUrl + endpoint
        : this._baseUrl + endpoint + '/';
  }
}
