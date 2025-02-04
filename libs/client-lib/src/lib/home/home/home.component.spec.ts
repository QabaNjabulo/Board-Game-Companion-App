import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ClientLibRoutingModule } from '../../client-lib-routing.module';
import { HomeComponent } from './home.component';
import { BggSearchService } from '../../shared/services/bgg-search/bgg-search.service';
import { Router } from '@angular/router';
import { CollectionService } from '../../shared/services/collections/collection.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let service: BggSearchService;
  let collectionService:CollectionService;

  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [HttpClientTestingModule,ClientLibRoutingModule,RouterTestingModule.withRoutes([])],
      providers: [BggSearchService,CollectionService]
    }).compileComponents();
  });

  it('should create component', () => {
    service = TestBed.inject(BggSearchService);
    router = TestBed.inject(Router);
    collectionService = TestBed.inject(CollectionService);
    component = new HomeComponent(service,router,collectionService);
    expect(component).toBeTruthy();
  });
  it('should create service', ()=>{
    service = TestBed.inject(BggSearchService);
    router = TestBed.inject(Router);
    collectionService = TestBed.inject(CollectionService);
    component = new HomeComponent(service,router,collectionService);
    expect(service).toBeTruthy();
  });
  it('should be undefined ids!', ()=>{
    service = TestBed.inject(BggSearchService);
    router = TestBed.inject(Router);
    collectionService = TestBed.inject(CollectionService);
    component = new HomeComponent(service,router,collectionService);
    expect(component.ids).toStrictEqual(undefined);
  });

});