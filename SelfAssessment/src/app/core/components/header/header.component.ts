import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';
import { LoggingService } from 'src/app/shared/logging/logging.service';
import { ResourceService } from '../../services/resource.service';
import { MatSelectChange } from '@angular/material';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  lang: string[];

  constructor(
    private storageService: LocalStorageService,
    private logging: LoggingService,
    private resourceService: ResourceService
  ) { }

  ngOnInit() {

    this.lang = this.storageService.getAllResources()
      .map(obj => obj.language);
  }

  langChange(matselect: MatSelectChange) {
    this.logging.info(`Change language to ${matselect.value}`);
    this.resourceService.changeLang(matselect.value);
  }

}