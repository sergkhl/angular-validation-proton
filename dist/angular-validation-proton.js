(function () {
    angular.module('validation', ['validation.provider', 'validation.directive']);
}).call(this);
(function () {
    angular.module('validation.provider', [])
        .provider('$validation', function () {


            var $injector,
                $scope,
                $http,
                $q,
                _this = this;


            /**
             * Setup the provider
             * @param injector
             */
            var setup = function (injector) {
                $injector = injector;
                $scope = $injector.get('$rootScope');
                $http = $injector.get('$http');
                $q = $injector.get('$q');
            };


            /**
             * Define validation type RegExp
             * @type {{required: RegExp, url: RegExp, email: RegExp}}
             */
            var expression = {
                required: /^.+$/,
                url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
                email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
                number: /^\d*$/,
                word: /^[а-яА-ЯёЁa-zA-Z]*$/,
                spaceWord: /^[а-яА-ЯёЁa-zA-Z-\s]*$/,
                punctuationWord: /^[а-яА-ЯёЁa-zA-Z-\.\,]*$/,
                minMaxLength: /^.{5,250}$/,
                date: /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[012])\.(19|20)\d\d$/
            };


            /**
             * default error, success message
             * @type {{required: {error: string, success: string}, url: {error: string, success: string}, email: {error: string, success: string}, number: {error: string, success: string}}}
             */
            var defaultMsg = {
                required: {
                    error: 'This should be Required!!',
                    success: 'It\'s Required'
                },
                url: {
                    error: 'This should be Url',
                    success: 'It\'s Url'
                },
                email: {
                    error: 'This should be Email',
                    success: 'It\'s Email'
                },
                number: {
                    error: 'This should be Number',
                    success: 'It\'s Number'
                },
                word: {
                    error: 'Поле должно содержать только буквы',
                    success: 'success'
                },
                spaceWord: {
                    error: 'Поле должно содержать только буквы пробел или символ: -',
                    success: 'success'
                },
                punctuationWord: {
                    error: 'Поле должно содержать только буквы или символы: . , -',
                    success: 'success'
                },
                minMaxLength: {
                    error: 'Минимальная длина должна быть 5 символов, максимальная 250',
                    success: 'success'
                },
                date: {
                    error: 'Некорректная дата',
                    success: 'success'
                }
            };


            /**
             * Allow user to set a custom Expression, do remember set the default message using setDefaultMsg
             * @param obj
             */
            this.setExpression = function (obj) {
                angular.extend(expression, obj);
            };


            /**
             * Get the Expression
             * @param exprs
             * @returns {*}
             */
            this.getExpression = function (exprs) {
                return expression[exprs];
            };


            /**
             * Allow user to set default message
             * @param obj
             */
            this.setDefaultMsg = function (obj) {
                angular.extend(defaultMsg, obj);
            };


            /**
             * Get the Default Message
             * @param msg
             * @returns {*}
             */
            this.getDefaultMsg = function (msg) {
                return defaultMsg[msg];
            };


            /**
             * Override the errorHTML function
             * @param func
             */
            this.setErrorHTML = function (func) {
                if (func.constructor !== Function) {
                    return;
                }

                _this.getErrorHTML = func;
            };


            /**
             * Invalid message HTML, here's the default
             * @param message
             * @returns {string}
             */
            this.getErrorHTML = function (message) {
                return '<p class="validation-invalid">' + message + '</p>';
            };


            /**
             * Override the successHTML function
             * @param func
             */
            this.setSuccessHTML = function (func) {
                if (func.constructor !== Function) {
                    return;
                }

                _this.getSuccessHTML = func;
            };


            /**
             * Valid message HTML, here's the default
             * @param message
             * @returns {string}
             */
            this.getSuccessHTML = function (message) {
                return '<p class="validation-valid">' + message + '</p>';
            };


            /**
             * Whether show the validation success message
             * You can easily change this to false in your config
             * example: $validationProvider.showSuccessMessage = false;
             * @type {boolean}
             */
            this.showSuccessMessage = true;


            /**
             * Whether show the validation error message
             * You can easily change this to false in your config
             * example: $validationProvider.showErrorMessage = false;
             * @type {boolean}
             */
            this.showErrorMessage = true;


            /**
             * Check form valid, return true
             * checkValid(Form): Check the specific form(Form) valid from angular `$valid`
             * @param form
             * @returns {boolean}
             */
            this.checkValid = function (form) {
                if (form.$valid === undefined) {
                    return false;
                }
                return (form && form.$valid === true);
            };


            /**
             * Validate the form when click submit, when `validMethod = submit`
             * @param form
             * @returns {promise|*}
             */
            this.validate = function (form) {

                var idx = 0;

                for (var k in form) {
                    if (form[k].hasOwnProperty('$dirty')) {
                        $scope.$broadcast(k + 'submit', idx++);
                    }
                }

                var deferred = $q.defer();
                deferred.promise.success = function (fn) {
                    deferred.promise.then(function (value) {
                        fn(value);
                    });
                    return deferred.promise;
                };

                deferred.promise.error = function (fn) {
                    deferred.promise.then(null, function (value) {
                        fn(value);
                    });
                    return deferred.promise;
                };

                if (_this.checkValid(form)) {
                    deferred.resolve('success');
                }
                else {
                    deferred.reject('error');
                }

                return deferred.promise;
            };


            /**
             * reset the specific form
             * @param form
             */
            this.reset = function (form) {
                for (var k in form) {
                    if (form[k].hasOwnProperty('$dirty')) {
                        $scope.$broadcast(k + 'reset');
                    }
                }
            };


            /**
             * $get
             * @returns {{setErrorHTML: *, getErrorHTML: Function, setSuccessHTML: *, getSuccessHTML: Function, setExpression: *, getExpression: Function, setDefaultMsg: *, getDefaultMsg: Function, checkValid: Function, validate: Function, reset: Function}}
             */
            this.$get = ['$injector', function ($injector) {
                setup($injector);
                return {
                    setErrorHTML: this.setErrorHTML,
                    getErrorHTML: this.getErrorHTML,
                    setSuccessHTML: this.setSuccessHTML,
                    getSuccessHTML: this.getSuccessHTML,
                    setExpression: this.setExpression,
                    getExpression: this.getExpression,
                    setDefaultMsg: this.setDefaultMsg,
                    getDefaultMsg: this.getDefaultMsg,
                    showSuccessMessage: this.showSuccessMessage,
                    showErrorMessage: this.showErrorMessage,
                    checkValid: this.checkValid,
                    validate: this.validate,
                    reset: this.reset
                };
            }];

        });
}).call(this);

(function () {
    angular.module('validation.directive', ['validation.provider'])
        .directive('validator', ['$injector', '$compile', function ($injector, $compile) {
            var $validationProvider = $injector.get('$validation'),
                $q = $injector.get('$q'),
                $timeout = $injector.get('$timeout');

            /**
             * Do this function iff validation valid
             * @param element
             * @param validMessage
             * @param validation
             * @param callback
             * @param ctrl
             * @returns {}
             */
            var validFunc = function (element, validMessage, validation, callback, ctrl, errList) {
                var errIndex = errList.map(function (element) {
                    return element.name;
                }).indexOf(validation);
                if (errIndex != -1) {
                    errList.splice(errIndex, 1);
                }

                if ($validationProvider.showSuccessMessage) {
                    //element.next().html($validationProvider.getSuccessHTML(validMessage || $validationProvider.getDefaultMsg(validation).success));
                } else {
                    //element.next().html('');
                }
                errList.length ? false : ctrl.$setValidity(ctrl.$name, true);
                /**
                 * @todo move to ng-class
                 */
                if (!errList.length && ctrl.$dirty) {
                    element.parent().addClass('has-success');
                    element.parent().removeClass('has-error');
                }
                if (callback) callback();

                return true;
            };


            /**
             * Do this function if validation invalid
             * @param element
             * @param validMessage
             * @param validation
             * @param callback
             * @param ctrl
             * @returns {}
             */
            var invalidFunc = function (element, validMessage, validation, callback, ctrl, errList) {
                var errIndex = errList.map(function (element) {
                    return element.name;
                }).indexOf(validation);
                if (errIndex == -1) {
                    errList.push({
                        "name": validation,
                        "message": (validMessage || $validationProvider.getDefaultMsg(validation).error)
                    });
                }
                if ($validationProvider.showErrorMessage) {
//                    if (errList.indexOf(validation) == -1) {
//                        errList.push(validation);
//                    }
                    //element.next().html($validationProvider.getErrorHTML(validMessage || $validationProvider.getDefaultMsg(validation).error));
                } else {
                    //element.next().html('');
                }

                errList.length ? ctrl.$setValidity(ctrl.$name, false) : false;
                if (errList.length) {
                    element.parent().addClass('has-error');
                    element.parent().removeClass('has-success');
                }
                if (callback) callback();

                return false;
            };


            /**
             * If var is true, focus element when validate end
             * @type {boolean}
             ***private variable
             */
            var isFocusElement = false;


            /**
             * Check Validation with Function or RegExp
             * @param scope
             * @param element
             * @param attrs
             * @param ctrl
             * @param validation
             * @param value
             * @returns {}
             */
            var checkValidation = function (scope, element, attrs, ctrl, validation, value) {
                var successMessage = validation + 'SuccessMessage',
                    errorMessage = validation + 'ErrorMessage',
                    expressionType = $validationProvider.getExpression(validation).constructor,
                    valid = {
                        success: function () {
                            return validFunc(element, attrs[successMessage], validation, scope.validCallback, ctrl, scope.errList);
                        },
                        error: function () {
//                            console.log('Error', value);
                            return invalidFunc(element, attrs[errorMessage], validation, scope.invalidCallback, ctrl, scope.errList);
                        }
                    };

                // Check with Function
                if (expressionType === Function) {
                    return $q.all([$validationProvider.getExpression(validation)(value)])
                        .then(function (data) {
                            if (data && data.length > 0 && data[0]) {
                                return valid.success();
                            } else {
                                return valid.error();
                            }
                        }, function () {
                            return valid.error();
                        });
                }
                // Check with RegExp
                else if (expressionType === RegExp) {
                    return $validationProvider.getExpression(validation).test(value) ? valid.success() : valid.error();
                } else {
                    return valid.error();
                }
            };

            var checkLength = function (curLength, length) {

            }

            return {
                restrict: 'A',
                require: 'ngModel',
                scope: {
                    model: '=ngModel',
                    validCallback: '&',
                    invalidCallback: '&'
                },
                link: function (scope, element, attrs, ctrl) {
                    /**
                     * watch
                     * @type {watch}
                     *
                     * Use to collect scope.$watch method
                     *
                     * use watch() to destroy the $watch method
                     */
                    var watch = function () {
                    };

                    scope.errList = [];

                    /**
                     * validator
                     * @type {*|Array}
                     *
                     * Convert user input String to Array
                     */
                    var validator = attrs.validator.split(',');

                    if (attrs.length) {
                        var curLength = element[0].value.length;
                        length = attrs.length.split(',');

                        function isNumber(n) {
                            return !isNaN(parseFloat(n)) && isFinite(n);
                        }

                        var minLen = length[0];
                        var maxLen = length[1];

                        if (isNumber(minLen) && minLen == maxLen) {
                            /**
                             * strictLength validation
                             */
                            $validationProvider.setExpression({
                                /**
                                 * @param value , user input
                                 * @returns {boolean} true iff valid
                                 */
                                strictLength: function (value) {
                                    var len = minLen;
                                    return value.length == len;
                                }
                            });

                            $validationProvider.setDefaultMsg({
                                strictLength: {
                                    error: 'Количество символов должно быть ' + minLen,
                                    success: 'Thanks!'
                                }
                            });
                            validator.push('strictLength');
                        } else {
                            if (isNumber(minLen)) {
                                /**
                                 * minLength validation
                                 */
                                $validationProvider.setExpression({
                                    /**
                                     * @param value , user input
                                     * @returns {boolean} true iff valid
                                     */
                                    minLength: function (value) {
                                        var len = minLen;
                                        return value.length > len;
                                    }
                                });
                                if (minLen == 0) {
                                    $validationProvider.setDefaultMsg({
                                        minLength: {
                                            error: 'Поле не должно быть пустым',
                                            success: 'Thanks!'
                                        }
                                    });
                                } else {
                                    $validationProvider.setDefaultMsg({
                                        minLength: {
                                            error: 'Количество символов менее ' + minLen,
                                            success: 'Thanks!'
                                        }
                                    });
                                }
                                validator.push('minLength');
                            }

                            if (isNumber(maxLen)) {
                                /**
                                 * maxLength validation
                                 */
                                $validationProvider.setExpression({
                                    /**
                                     * @param value , user input
                                     * @returns {boolean} true iff valid
                                     */
                                    maxLength: function (value) {
                                        var len = maxLen;
                                        return value.length < len;
                                    }
                                });

                                $validationProvider.setDefaultMsg({
                                    maxLength: {
                                        error: 'Количество символов более ' + maxLen,
                                        success: 'Thanks!'
                                    }
                                });
                                validator.push('maxLength');
                            }
                        }
                    }

                    /**
                     * Valid/Invalid Message
                     */
                    //element.after('<span></span>');


                    /**
                     * Set Validity to false when Initial
                     */
                    ctrl.$setValidity(ctrl.$name, false);

                    /**
                     * Reset the validation for specific form
                     */
                    scope.$on(ctrl.$name + 'reset', function () {
                        /**
                         * clear scope.$watch here
                         * when reset status
                         * clear the $watch method to prevent
                         * $watch again while reset the form
                         */
                        watch();

                        scope.model = angular.copy(scope.original);
                        isFocusElement = false;
                        //ctrl.$setViewValue('');
                        element.parent().removeClass('has-success has-error');
                        ctrl.$setPristine();
                        ctrl.$setValidity(ctrl.$name, true);
                        ctrl.$render();
                    });

                    /**
                     * Check Every validator
                     */
                    validator.forEach(function (validation) {

                        /**
                         * Click submit form, check the validity when submit
                         */
                        scope.$on(ctrl.$name + 'submit', function (event, index) {
                            var value = element[0].value,
                                isValid = false;

                            if (index == 0) {
                                isFocusElement = false;
                            }

                            isValid = checkValidation(scope, element, attrs, ctrl, validation, value);

                            if (attrs.validMethod === 'submit') {
                                watch(); // clear previous scope.$watch
                                watch = scope.$watch('model', function (value, oldValue) {

                                    // don't watch when init
                                    if (value === oldValue) {
                                        return;
                                    }

                                    // scope.$watch will translate '' to undefined
                                    // undefined/null will pass the required submit /^.+/
                                    // cause some error in this validation
                                    if (value === undefined || value === null) {
                                        value = '';
                                    }
                                    isValid = checkValidation(scope, element, attrs, ctrl, validation, value);
                                });

                            }

                            // Focus first input element when submit error #11
                            if (!isFocusElement && !isValid) {
                                isFocusElement = true;
                                element[0].focus();
                            }
                        });

                        /**
                         * Validate blur method
                         */
                        if (attrs.validMethod === 'blur') {
                            element.bind('blur', function () {
                                var value = element[0].value;
                                checkValidation(scope, element, attrs, ctrl, validation, value);
                            });

                            return;
                        }

                        /**
                         * Validate submit & submit-only method
                         */
                        if (attrs.validMethod === 'submit' || attrs.validMethod === 'submit-only') {
                            return;
                        }

                        /**
                         * Validate watch method
                         * This is the default method
                         */
                        scope.$watch('model', function (value) {
                            /**
                             * dirty, pristine, viewValue control here
                             */
                            if (ctrl.$pristine && ctrl.$viewValue) {
                                scope.original = angular.copy(value);
                                //scope.dirty = false;
                                // has value when initial
                                //ctrl.$setViewValue(ctrl.$viewValue);
                            } else if (ctrl.$pristine) {
                                // Don't validate form when the input is clean(pristine)
                                //element.next().html('');
                                return;
                            }
//                            else {
//                                scope.$parent.issuedChanged = true;
//                                scope.dirty = true;
//                            }

                            checkValidation(scope, element, attrs, ctrl, validation, value);
                        });
                    });

                    $timeout(function () {
                        /**
                         * Don't showup the validation Message
                         */
                        attrs.$observe('noValidationMessage', function (value) {
                            var el = element.next();
                            if (value == "true" || value == true) {
                                el.css('display', 'none');
                            } else if (value == "false" || value == false) {
                                el.css('display', 'block');
                            } else {
                            }
                        });
                    });

                    //var validityClass = '\'has-success has-feedback\' : ' + element.closest("form").attr('name') + '.' + ctrl.attr('name') + '.$valid && ' + element.closest("form").attr('name') + '.' + ctrl.attr('name') + '.$dirty, \'has-error has-feedback\': ' + element.closest("form").attr('name') + '.' + ctrl.attr('name') + '.$invalid && ' + element.closest("form").attr('name') + '.' + ctrl.attr('name') + '.$dirty';
                    //element.wrapAll('<div class="has-feedback" />');
//                    element.wrapAll('<div />');
                    element.wrap('<div />');
                    //element.wrapAll('<div ng-class="errList.length ? \'has-error\' : \'has-success\'" class="has-feedback" />');
                    //parentDiv = element.removeAttr('validator').parent();
                    //parentDiv = $compile(parentDiv)(scope);

                    /**
                     * @todo attr for icons-show
                     */
                    var contentTr = angular.element(
//                        '<span ng-show="!errList.length && dirty" class="glyphicon glyphicon-ok form-control-feedback"></span>' +
//                        '<span ng-show="errList.length" class="glyphicon glyphicon-remove form-control-feedback"></span>' +
                        '<div class="custom-error"><span ng-repeat="err in errList | limitTo:1">{{err.message}}</span></div>');
                    //contentTr.insertAfter(element);
                    element.parent().append(contentTr);
                    $compile(contentTr)(scope);
                }
            };

        }]);
}).call(this);