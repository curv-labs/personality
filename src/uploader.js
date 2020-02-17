import ajax from '@codexteam/ajax';

/**
 * Module for file uploading.
 */
export default class Uploader {
  /**
   * @param {PersonalityConfig} config
   * @param {function} onUpload - one callback for all uploading (file, d-n-d, pasting)
   * @param {function} onError - callback for uploading errors
   */
  constructor({ config, onUpload, onError }) {
    this.config = config;
    this.onUpload = onUpload;
    this.onError = onError;
  }

  /**
   * Handle clicks on the upload file button
   * @fires ajax.transport()
   * @param {function} onPreview - callback fired when preview is ready
   */
  uploadSelectedFile({ onPreview }) {
    // debugger;

    const preparePreview = function (file) {
      const reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (e) => {
        onPreview(e.target.result);
      };
    };

    /**
     * Custom uploading
     * or default uploading
     */
    let upload;

    // If the config has a custom
    if (this.config.uploader && typeof this.config.uploader.selector === 'function') {
    	upload = this.config.uploader.selector();
    } else {
      // custom uploading
      if (this.config.uploader && typeof this.config.uploader.uploadByFile === 'function') {
        debugger;
        upload = ajax.selectFiles({ accept: this.config.types }).then((files) => {
          preparePreview(files[0]);

          const customUpload = this.config.uploader.uploadByFile(files[0]);

          if (!isPromise(customUpload)) {
            console.warn('Custom uploader method uploadByFile should return a Promise');
          }

          return customUpload;
        });

        // default uploading
      } else {
        upload = ajax.transport({
          url: this.config.endpoints.byFile,
          data: this.config.additionalRequestData,
          accept: this.config.types,
          headers: this.config.additionalRequestHeaders,
          beforeSend: (files) => {
            preparePreview(files[0]);
          },
          fieldName: this.config.field
        }).then((response) => response.body);
      }
    }

    upload.then((response) => {
      this.onUpload(response);
    }).catch((error) => {
      this.onError(error);
    });
  }
}
