
import { tap } from 'rxjs/operators';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Balance } from '../../../models/balance';
import { AddressesService } from '../../../services/addresses.service';
import { ErrorService } from '../../../services/error.service';
import { LightWalletTransaction } from '../../../models/light-wallet-transaction';

import { getNumberOfRowsForScreen } from '../../../utils';
import { addressLabels } from '../../../config';
import { TposContract } from '../../../models/tposcontract';
import { WrappedResult } from '../../../models/wrapped-result';
import { Transaction } from '../../../models/transaction';

@Component({
  selector: 'app-address-details',
  templateUrl: './address-details.component.html',
  styleUrls: ['./address-details.component.css']
})
export class AddressDetailsComponent implements OnInit {

  address: Balance;
  addressString: string;
  addressLabel = addressLabels;
  tposContracts: Array<TposContract>;
  selectedTpos: number;

  // pagination
  limit = 30;
  transactions: Transaction[] = [];
  items: LightWalletTransaction[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private addressesService: AddressesService,
    private errorService: ErrorService) { 
      this.selectedTpos = 0;
    }

  ngOnInit() {
    const height = this.getScreenSize();
    this.limit = getNumberOfRowsForScreen(height);
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.reload();
      }
    });
    this.reload();
  }

  reload() {
    this.addressString = this.route.snapshot.paramMap.get('id');
    this.addressesService.get(this.addressString).subscribe(
      response => this.onAddressRetrieved(response),
      response => this.onError(response)
    );
    this.addressesService.getTposContracts(this.addressString).subscribe(
      response => this.onTposContractsReceived(response),
      response => this.onError(response)
    );
  }

  private onAddressRetrieved(response: Balance) {
    this.address = response;
  }

  private onTposContractsReceived(response: WrappedResult<TposContract>) {
    this.tposContracts = response.data;
    console.log(this.tposContracts);
  }

  selectTpos(index) {
    this.selectedTpos = index;
  }

  @HostListener('window:resize', ['$event'])
  private getScreenSize(_?): number {
    return window.innerHeight;
  }

  private onError(response: any) {
    this.errorService.renderServerErrors(null, response);
  }
}
