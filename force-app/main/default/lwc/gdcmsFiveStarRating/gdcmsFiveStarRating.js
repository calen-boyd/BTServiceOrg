import { LightningElement, api } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
//import fivestar static resource, call it fivestar
//import fivestar from '@salesforce/resourceUrl/fivestar';

import fivestar from '@salesforce/resourceUrl/GDC_MS_fivestar1';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// add constants here
const ERROR_TITLE = 'Error loading five-star';
const ERROR_VARIANT = 'error';
const EDITABLE_CLASS = 'c-rating';
const READ_ONLY_CLASS = 'readonly c-rating';
export default class GdcmsFiveStarRating extends LightningElement {
  //initialize public readOnly and value properties
  @api readOnly = false;
  @api value = 0;
  @api totalFeedbackCount;

  editedValue;
  isRendered;

  //getter function that returns the correct class depending on if it is readonly
  get starClass() {
    return this.readOnly ? READ_ONLY_CLASS : EDITABLE_CLASS;
  }

  // Render callback to load the script once the component renders.
  renderedCallback() {
    if (this.isRendered) {
      return;
    }
    this.loadScript();
    this.isRendered = true;
   // console.log(`value=> ${this.value}`);
  }

  //Method to load the 3rd party script and initialize the rating.
  //call the initializeRating function after scripts are loaded
  //display a toast with error message if there is an error loading script
  loadScript() {
    Promise.all([
      loadScript(this, fivestar + '/rating.js'),
      loadStyle(this, fivestar + '/rating.css')
    ]).then(() => {
      //console.log('rendered properly');
      this.initializeRating();
    }).catch(error => {
      this.dispatchEvent(new ShowToastEvent({
        title: ERROR_TITLE,
        message: error.body.message,
        variant: ERROR_VARIANT
      }));
    });
  }

  @api initializeRating() {
    let domEl = this.template.querySelector('ul');
    //Remove existing child <li> tags. This helps in rerendering the star component on rating update.
    while (domEl.firstChild) {
      domEl.removeChild(domEl.firstChild);
    }
   
    let maxRating = 5;
    let self = this;
    let callback = function (rating) {
      self.editedValue = rating;
      self.ratingChanged(rating);
    };
    this.ratingObj = window.rating(
      domEl,
      this.value,
      maxRating,
      callback,
      this.readOnly
    );
    let li = document.createElement('li');
    li.innerText = this.totalFeedbackCount?'('+this.totalFeedbackCount+')':'';
    li.style.cssText = 'font-size: 1.1em;padding-inline: 3px;padding-block: 3px;'
    li.title = 'Number of Feedbacks';
    domEl.appendChild(li);
  }

  // Method to fire event called ratingchange with the following parameter:
  // {detail: { rating: CURRENT_RATING }}); when the user selects a rating
  ratingChanged(rating) {
    const fireEvent = new CustomEvent('ratingchange', {
      detail: { rating: rating }
    });
    this.dispatchEvent(fireEvent);
  }
}