
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/auth/login": {
        "post": {
          "operationId": "AuthController_login",
          "summary": "Try login user to the system",
          "parameters": [],
          "requestBody": {
            "required": true,
            "description": "Example request body",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AuthCredentialsModel"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns JWT accessToken (expired after 8 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30d ays).",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "If the password or login is wrong"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_refreshToken",
          "summary": "Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing). Device LastActiveDate should be overrode by issued Date of new refresh token",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns JWT accessToken (expired after 8 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30days).",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/registration-confirmation": {
        "post": {
          "operationId": "AuthController_registrationConfirmation",
          "summary": "Confirm registration.",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/ConfirmationCodeModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Email was verified. Account was activated"
            },
            "400": {
              "description": "If the confirmation code is incorrect, expired or already been applied",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/registration": {
        "post": {
          "operationId": "AuthController_registration",
          "summary": "Registration in the system. Email with confirmation code will be send to passed email address.",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Input data is accepted. Email with confirmation code will be send to passed email address"
            },
            "400": {
              "description": "If the inputModel has incorrect values (in particular if the user with the given email or login already exists)",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_resendEmailConfirmationCode",
          "summary": "Resend confirmation registration Email if user exists",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailResendModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "summary": "In cookie client must send correct refreshToken that will be revoked",
          "parameters": [],
          "responses": {
            "204": {
              "description": "No content"
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/me": {
        "get": {
          "operationId": "AuthController_getAuthUserData",
          "summary": "Get information about current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "email": "string",
                      "login": "string",
                      "userId": "string"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Auth"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogs": {
        "get": {
          "operationId": "BlogsController_findBlogs",
          "summary": "Returns blogs with paging",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "searchNameTerm",
              "required": false,
              "in": "query",
              "description": "Search term for blog Name: Name should contains this term in any position",
              "schema": {
                "default": null,
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "pagesCount": 0,
                      "page": 0,
                      "pageSize": 0,
                      "totalCount": 0,
                      "items": [
                        {
                          "id": "string",
                          "name": "string",
                          "description": "string",
                          "websiteUrl": "string",
                          "createdAt": "2023-03-13T11:10:21.007Z",
                          "isMembership": false,
                          "images": {
                            "wallpaper": {
                              "url": "string",
                              "width": 0,
                              "height": 0,
                              "fileSize": 0
                            },
                            "main": [
                              {
                                "url": "string",
                                "width": 0,
                                "height": 0,
                                "fileSize": 0
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/blogs/{blogId}/posts": {
        "get": {
          "operationId": "BlogsController_findPostsOfBlog",
          "summary": "Returns all posts for specified blog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "description": "Existing blog id",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/blogs/{blogId}": {
        "get": {
          "operationId": "BlogsController_getBlogById",
          "summary": "Returns blog by id",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "description": "Existing blog id",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "name": "string",
                      "description": "string",
                      "websiteUrl": "string",
                      "createdAt": "2023-03-13T11:10:21.007Z",
                      "isMembership": false,
                      "images": {
                        "wallpaper": {
                          "url": "string",
                          "width": 0,
                          "height": 0,
                          "fileSize": 0
                        },
                        "main": [
                          {
                            "url": "string",
                            "width": 0,
                            "height": 0,
                            "fileSize": 0
                          }
                        ]
                      }
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Blogs"
          ]
        }
      },
      "/posts/{postId}/like-status": {
        "put": {
          "operationId": "PostsController_likePost",
          "summary": "Make like/unlike/dislike/undislike operation",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "If post with specified id doesn't exists"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/posts/{postId}/comments": {
        "get": {
          "operationId": "PostsController_findCommentsOfPost",
          "summary": "Returns comments for specified post",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "pagesCount": 0,
                      "page": 0,
                      "pageSize": 0,
                      "totalCount": 0,
                      "items": [
                        {
                          "id": "string",
                          "content": "string",
                          "commentatorInfo": {
                            "userId": "string",
                            "userLogin": "string"
                          },
                          "createdAt": "2023-03-13T12:42:19.885Z",
                          "likesInfo": {
                            "likesCount": 0,
                            "dislikesCount": 0,
                            "myStatus": "None"
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            "404": {
              "description": "If post for passed postId doesn't exist"
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "post": {
          "operationId": "PostsController_createComment",
          "summary": "Create new comment",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateCommentModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "content": "string",
                      "commentatorInfo": {
                        "userId": "string",
                        "userLogin": "string"
                      },
                      "createdAt": "2023-03-13T12:42:19.885Z",
                      "likesInfo": {
                        "likesCount": 0,
                        "dislikesCount": 0,
                        "myStatus": "None"
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "If post with specified id doesn't exists"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/posts": {
        "get": {
          "operationId": "PostsController_findAllPosts",
          "summary": "Returns all posts",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "pagesCount": 0,
                      "page": 0,
                      "pageSize": 0,
                      "totalCount": 0,
                      "items": [
                        {
                          "id": "string",
                          "title": "string",
                          "shortDescription": "string",
                          "content": "string",
                          "blogId": "string",
                          "blogName": "string",
                          "createdAt": "2023-03-13T14:30:27.512Z",
                          "extendedLikesInfo": {
                            "likesCount": 0,
                            "dislikesCount": 0,
                            "myStatus": "None",
                            "newestLikes": [
                              {
                                "addedAt": "2023-03-13T14:30:27.512Z",
                                "userId": "string",
                                "login": "string"
                              }
                            ]
                          },
                          "images": {
                            "main": [
                              {
                                "url": "string",
                                "width": 0,
                                "height": 0,
                                "fileSize": 0
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Posts"
          ]
        }
      },
      "/posts/{postId}": {
        "get": {
          "operationId": "PostsController_getPostById",
          "summary": "Return post by id",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "title": "string",
                      "shortDescription": "string",
                      "content": "string",
                      "blogId": "string",
                      "blogName": "string",
                      "createdAt": "2023-03-13T14:30:27.512Z",
                      "extendedLikesInfo": {
                        "likesCount": 0,
                        "dislikesCount": 0,
                        "myStatus": "None",
                        "newestLikes": [
                          {
                            "addedAt": "2023-03-13T14:30:27.512Z",
                            "userId": "string",
                            "login": "string"
                          }
                        ]
                      },
                      "images": {
                        "main": [
                          {
                            "url": "string",
                            "width": 0,
                            "height": 0,
                            "fileSize": 0
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "Posts"
          ]
        }
      },
      "/comments/{commentId}/like-status": {
        "put": {
          "operationId": "CommentsController_likeComment",
          "summary": "Make like/unlike/dislike/undislike operation",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LikeModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "If comment with specified id doesn't exists"
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/comments/{commentId}": {
        "put": {
          "operationId": "CommentsController_updateComment",
          "summary": "Update existing comment by id with InputModel",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCommentModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No content"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If try edit the comment that is not your own"
            },
            "404": {
              "description": "If comment not found"
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "CommentsController_deleteComment",
          "summary": "Delete specified comment by id",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No content"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If try delete the comment that is not your own"
            },
            "404": {
              "description": "If comment not found"
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "get": {
          "operationId": "CommentsController_getCommentById",
          "summary": "Return comment by id",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "content": "string",
                      "commentatorInfo": {
                        "userId": "string",
                        "userLogin": "string"
                      },
                      "createdAt": "2023-03-13T12:42:19.885Z",
                      "likesInfo": {
                        "likesCount": 0,
                        "dislikesCount": 0,
                        "myStatus": "None"
                      }
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "Comments"
          ]
        }
      },
      "/security/devices": {
        "get": {
          "operationId": "SessionsController_getSessionsOfUser",
          "summary": "Returns all devices with active sessions for current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": [
                      {
                        "ip": "string",
                        "title": "string",
                        "lastActiveDate": "string",
                        "deviceId": "string"
                      }
                    ]
                  }
                }
              }
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            }
          },
          "tags": [
            "SecurityDevices"
          ]
        },
        "delete": {
          "operationId": "SessionsController_deleteSessionExceptCurrent",
          "summary": "Terminate all other (exclude current) device's sessions",
          "parameters": [],
          "responses": {
            "204": {
              "description": "No content"
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            }
          },
          "tags": [
            "SecurityDevices"
          ]
        }
      },
      "/security/devices/{deviceId}": {
        "delete": {
          "operationId": "SessionsController_deleteSessionByDeviceId",
          "summary": "Terminate specified device session",
          "parameters": [
            {
              "name": "deviceId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            },
            "403": {
              "description": "If try to delete the deviceId of other user"
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "SecurityDevices"
          ]
        }
      },
      "/blogger/blogs/{blogId}/images/wallpaper": {
        "post": {
          "operationId": "BloggerController_uploadBlogWallpaper",
          "summary": "Upload background wallpaper for Blog (.png or .jpg (.jpeg) file (max size is 100KB, width must be 1028, height must be 312px))",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Uploaded image information object",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "wallpaper": {
                        "url": "string",
                        "width": 0,
                        "height": 0,
                        "fileSize": 0
                      },
                      "main": [
                        {
                          "url": "string",
                          "width": 0,
                          "height": 0,
                          "fileSize": 0
                        }
                      ]
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If file format is incorrect",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to update blog that doesn't belong to current user"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/blogs/{blogId}/images/main": {
        "post": {
          "operationId": "BloggerController_uploadMainBlogImage",
          "summary": "Upload main square image for Blog (.png or .jpg (.jpeg) file (max size is 100KB, width must be 156, height must be 156))",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "description": "blog id",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Uploaded image information object",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "wallpaper": {
                        "url": "string",
                        "width": 0,
                        "height": 0,
                        "fileSize": 0
                      },
                      "main": [
                        {
                          "url": "string",
                          "width": 0,
                          "height": 0,
                          "fileSize": 0
                        }
                      ]
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If file format is incorrect",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to update blog that doesn't belong to current user"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/blogs/{blogId}/posts/{postId}/images/main": {
        "post": {
          "operationId": "BloggerController_uploadPostMainImage",
          "summary": "Upload main image for Post (.png or .jpg (.jpeg) file (max size is 100KB, width must be 940, height must be 432))",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Uploaded image information object",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "wallpaper": {
                        "url": "string",
                        "width": 0,
                        "height": 0,
                        "fileSize": 0
                      },
                      "main": [
                        {
                          "url": "string",
                          "width": 0,
                          "height": 0,
                          "fileSize": 0
                        }
                      ]
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If file format is incorrect",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to update blog that doesn't belong to current user"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/blogs/comments": {
        "get": {
          "operationId": "BloggerController_getAllCommentsForPostsOfBlogger",
          "summary": "Returns all comments for all posts inside all current user blogs",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "pagesCount": 0,
                      "page": 0,
                      "pageSize": 0,
                      "totalCount": 0,
                      "items": [
                        {
                          "id": "string",
                          "content": "string",
                          "commentatorInfo": {
                            "userId": "string",
                            "userLogin": "string"
                          },
                          "createdAt": "2023-03-13T14:30:27.512Z",
                          "postInfo": {
                            "id": "string",
                            "title": "string",
                            "blogId": "string",
                            "blogName": "string"
                          },
                          "likesInfo": {
                            "likesCount": 0,
                            "dislikesCount": 0,
                            "myStatus": "None"
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/blogs/{blogId}": {
        "put": {
          "operationId": "BloggerController_updateBlog",
          "summary": "Update existing Blog by id with InputModel",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateBlogModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to update blog that doesn't belong to current user"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "BloggerController_deleteBlog",
          "summary": "Delete blog specified by id",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "Forbidden"
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/blogs": {
        "post": {
          "operationId": "BloggerController_createBlog",
          "summary": "Create new blog",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateBlogModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Returns the newly created blog",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "name": "string",
                      "description": "string",
                      "websiteUrl": "string",
                      "createdAt": "2023-03-13T11:10:21.007Z",
                      "isMembership": false,
                      "images": {
                        "wallpaper": {
                          "url": "string",
                          "width": 0,
                          "height": 0,
                          "fileSize": 0
                        },
                        "main": [
                          {
                            "url": "string",
                            "width": 0,
                            "height": 0,
                            "fileSize": 0
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "get": {
          "operationId": "BloggerController_getOwnBlogs",
          "summary": "Returns blogs (for which current user is owner) with paging",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "searchNameTerm",
              "required": false,
              "in": "query",
              "description": "Search term for blog Name: Name should contains this term in any position",
              "schema": {
                "default": null,
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "pagesCount": 0,
                      "page": 0,
                      "pageSize": 0,
                      "totalCount": 0,
                      "items": [
                        {
                          "id": "string",
                          "name": "string",
                          "description": "string",
                          "websiteUrl": "string",
                          "createdAt": "2023-03-13T11:10:21.007Z",
                          "isMembership": false,
                          "images": {
                            "wallpaper": {
                              "url": "string",
                              "width": 0,
                              "height": 0,
                              "fileSize": 0
                            },
                            "main": [
                              {
                                "url": "string",
                                "width": 0,
                                "height": 0,
                                "fileSize": 0
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/blogs/{blogId}/posts": {
        "post": {
          "operationId": "BloggerController_createPostForBlog",
          "summary": "Create new post for specific blog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Returns the newly created post",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "title": "string",
                      "shortDescription": "string",
                      "content": "string",
                      "blogId": "string",
                      "blogName": "string",
                      "createdAt": "2023-03-13T14:30:27.512Z",
                      "extendedLikesInfo": {
                        "likesCount": 0,
                        "dislikesCount": 0,
                        "myStatus": "None",
                        "newestLikes": [
                          {
                            "addedAt": "2023-03-13T14:30:27.512Z",
                            "userId": "string",
                            "login": "string"
                          }
                        ]
                      },
                      "images": {
                        "main": [
                          {
                            "url": "string",
                            "width": 0,
                            "height": 0,
                            "fileSize": 0
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to add post to blog that doesn't belong to current user"
            },
            "404": {
              "description": "If specific blog doesn't exists"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/blogs/{blogId}/posts/{postId}": {
        "put": {
          "operationId": "BloggerController_updatePost",
          "summary": "Update existing post by id with InputModel",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePostModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to add post to blog that doesn't belong to current user"
            },
            "404": {
              "description": "If specific blog doesn't exists"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "BloggerController_deletePost",
          "summary": "Delete post by id",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            },
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If user try to delete post that doesn't belong to current user"
            },
            "404": {
              "description": "If specific post or blog doesn't exists"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/users/{userId}/ban": {
        "put": {
          "operationId": "BloggerController_banUserForBlog",
          "summary": "Ban/Unban user",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "description": "User ID that should be banned",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanUserForBlogModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No Content"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "example": {
                        "errorsMessages": [
                          {
                            "message": "string",
                            "field": "string"
                          }
                        ]
                      }
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/blogger/users/blog/{blogId}": {
        "get": {
          "operationId": "BloggerController_findBannedUsersOfSpecifiedBlog",
          "summary": "Returns all banned users for blog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "searchLoginTerm",
              "required": false,
              "in": "query",
              "description": "Search term for user Login: Login should contains this term in any position",
              "schema": {
                "default": null,
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "pagesCount": 0,
                      "page": 0,
                      "pageSize": 0,
                      "totalCount": 0,
                      "items": [
                        {
                          "id": "string",
                          "login": "string",
                          "banInfo": {
                            "isBanned": true,
                            "banDate": "2023-03-13T14:30:27.512Z",
                            "banReason": "string"
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Blogger"
          ],
          "security": [
            {
              "bearer": []
            },
            {
              "bearer": []
            }
          ]
        }
      },
      "/sa/blogs/{blogId}/ban": {
        "put": {
          "operationId": "SuperAdminController_banBlog",
          "parameters": [
            {
              "name": "blogId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanBlogInputModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/blogs": {
        "get": {
          "operationId": "SuperAdminController_findBlogs",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            },
            {
              "name": "searchNameTerm",
              "required": false,
              "in": "query",
              "description": "Search term for blog Name: Name should contains this term in any position",
              "schema": {
                "default": null,
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        }
      },
      "/sa/quiz/questions": {
        "get": {
          "operationId": "SuperAdminController_findQuestions",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "SuperAdminController_createQuestion",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateQuizQuestionModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/sa/quiz/questions/{questionId}": {
        "delete": {
          "operationId": "SuperAdminController_deleteQuestion",
          "parameters": [
            {
              "name": "questionId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        },
        "put": {
          "operationId": "SuperAdminController_updateQuestion",
          "parameters": [
            {
              "name": "questionId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateQuizQuestionModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/quiz/questions/{questionId}/publish": {
        "put": {
          "operationId": "SuperAdminController_publishQuestion",
          "parameters": [
            {
              "name": "questionId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PublishQuestionModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/users/{id}/ban": {
        "put": {
          "operationId": "SuperAdminController_banUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/BanUserModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/sa/users": {
        "get": {
          "operationId": "SuperAdminController_findUsers",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": ""
            }
          }
        },
        "post": {
          "operationId": "SuperAdminController_createUserByAdmin",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": ""
            }
          }
        }
      },
      "/sa/users/{id}": {
        "delete": {
          "operationId": "SuperAdminController_deleteUser",
          "parameters": [
            {
              "name": "id",
              "required": true,
              "in": "path",
              "schema": {
                "type": "number"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            }
          }
        }
      },
      "/pair-game-quiz/users/top": {
        "get": {
          "operationId": "QuizController_getTopUsers",
          "summary": "Get users top",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sort",
              "required": false,
              "in": "query",
              "schema": {
                "default": "?sort=avgScores desc&sort=sumScore desc",
                "type": "array",
                "items": {
                  "type": "string"
                }
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "sumScore": 0,
                      "avgScores": 0,
                      "gamesCount": 0,
                      "winsCount": 0,
                      "lossesCount": 0,
                      "drawsCount": 0,
                      "player": {
                        "id": "string",
                        "login": "string"
                      }
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "PairQuizGame"
          ]
        }
      },
      "/pair-game-quiz/users/my-statistic": {
        "get": {
          "operationId": "QuizController_getStatisticsOfUser",
          "summary": "Get current user statistic",
          "parameters": [],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "sumScore": 0,
                      "avgScores": 0,
                      "gamesCount": 0,
                      "winsCount": 0,
                      "lossesCount": 0,
                      "drawsCount": 0
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "PairQuizGame"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/pair-game-quiz/pairs/my": {
        "get": {
          "operationId": "QuizController_findGamesOfUser",
          "summary": "Returns all my games (closed games and current)",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            },
            {
              "name": "sortBy",
              "required": false,
              "in": "query",
              "schema": {
                "default": "createdAt",
                "type": "string"
              }
            },
            {
              "name": "sortDirection",
              "required": false,
              "in": "query",
              "schema": {
                "default": "desc",
                "enum": [
                  "asc",
                  "desc"
                ],
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns pair by id if current user is taking part in this pair",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "pagesCount": 0,
                      "page": 0,
                      "pageSize": 0,
                      "totalCount": 0,
                      "items": [
                        {
                          "id": "string",
                          "firstPlayerProgress": {
                            "answers": [
                              {
                                "questionId": "string",
                                "answerStatus": "Correct",
                                "addedAt": "2023-03-13T14:30:27.512Z"
                              }
                            ],
                            "player": {
                              "id": "string",
                              "login": "string"
                            },
                            "score": 0
                          },
                          "secondPlayerProgress": {
                            "answers": [
                              {
                                "questionId": "string",
                                "answerStatus": "Correct",
                                "addedAt": "2023-03-13T14:30:27.512Z"
                              }
                            ],
                            "player": {
                              "id": "string",
                              "login": "string"
                            },
                            "score": 0
                          },
                          "questions": [
                            {
                              "id": "string",
                              "body": "string"
                            }
                          ],
                          "status": "PendingSecondPlayer",
                          "pairCreatedDate": "2023-03-13T14:30:27.512Z",
                          "startGameDate": "2023-03-13T14:30:27.512Z",
                          "finishGameDate": "2023-03-13T14:30:27.512Z"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "PairQuizGame"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/pair-game-quiz/pairs/my-current": {
        "get": {
          "operationId": "QuizController_getCurrentGame",
          "summary": "Returns current unfinished user game",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns current pair in which current user is taking part",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "firstPlayerProgress": {
                        "answers": [
                          {
                            "questionId": "string",
                            "answerStatus": "Correct",
                            "addedAt": "2023-03-13T14:30:27.512Z"
                          }
                        ],
                        "player": {
                          "id": "string",
                          "login": "string"
                        },
                        "score": 0
                      },
                      "secondPlayerProgress": {
                        "answers": [
                          {
                            "questionId": "string",
                            "answerStatus": "Correct",
                            "addedAt": "2023-03-13T14:30:27.512Z"
                          }
                        ],
                        "player": {
                          "id": "string",
                          "login": "string"
                        },
                        "score": 0
                      },
                      "questions": [
                        {
                          "id": "string",
                          "body": "string"
                        }
                      ],
                      "status": "PendingSecondPlayer",
                      "pairCreatedDate": "2023-03-13T14:30:27.512Z",
                      "startGameDate": "2023-03-13T14:30:27.512Z",
                      "finishGameDate": "2023-03-13T14:30:27.512Z"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "If no active pair for current user"
            }
          },
          "tags": [
            "PairQuizGame"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/pair-game-quiz/pairs/{gameId}": {
        "get": {
          "operationId": "QuizController_getGameById",
          "summary": "Returns game by id",
          "parameters": [
            {
              "name": "gameId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns pair by id",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "firstPlayerProgress": {
                        "answers": [
                          {
                            "questionId": "string",
                            "answerStatus": "Correct",
                            "addedAt": "2023-03-13T14:30:27.512Z"
                          }
                        ],
                        "player": {
                          "id": "string",
                          "login": "string"
                        },
                        "score": 0
                      },
                      "secondPlayerProgress": {
                        "answers": [
                          {
                            "questionId": "string",
                            "answerStatus": "Correct",
                            "addedAt": "2023-03-13T14:30:27.512Z"
                          }
                        ],
                        "player": {
                          "id": "string",
                          "login": "string"
                        },
                        "score": 0
                      },
                      "questions": [
                        {
                          "id": "string",
                          "body": "string"
                        }
                      ],
                      "status": "PendingSecondPlayer",
                      "pairCreatedDate": "2023-03-13T14:30:27.512Z",
                      "startGameDate": "2023-03-13T14:30:27.512Z",
                      "finishGameDate": "2023-03-13T14:30:27.512Z"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If current user tries to get pair in which user is not participant"
            },
            "404": {
              "description": "If game not found"
            }
          },
          "tags": [
            "PairQuizGame"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/pair-game-quiz/pairs/connection": {
        "post": {
          "operationId": "QuizController_createGameOrConnectToExist",
          "summary": "Connect current user to existing random pending pair or create new pair which will be waiting second player",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns started existing pair or new pair with status \"PendingSecondPlayer\"",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "firstPlayerProgress": {
                        "answers": [
                          {
                            "questionId": "string",
                            "answerStatus": "Correct",
                            "addedAt": "2023-03-13T14:30:27.512Z"
                          }
                        ],
                        "player": {
                          "id": "string",
                          "login": "string"
                        },
                        "score": 0
                      },
                      "secondPlayerProgress": {
                        "answers": [
                          {
                            "questionId": "string",
                            "answerStatus": "Correct",
                            "addedAt": "2023-03-13T14:30:27.512Z"
                          }
                        ],
                        "player": {
                          "id": "string",
                          "login": "string"
                        },
                        "score": 0
                      },
                      "questions": [
                        {
                          "id": "string",
                          "body": "string"
                        }
                      ],
                      "status": "PendingSecondPlayer",
                      "pairCreatedDate": "2023-03-13T14:30:27.512Z",
                      "startGameDate": "2023-03-13T14:30:27.512Z",
                      "finishGameDate": "2023-03-13T14:30:27.512Z"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If current user is already participating in active pair"
            }
          },
          "tags": [
            "PairQuizGame"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/pair-game-quiz/pairs/my-current/answers": {
        "post": {
          "operationId": "QuizController_handleAnswerByPlayer",
          "summary": "Send answer for next not answered question in active pair",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/AnswerInputModel"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns answer result",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "questionId": "string",
                      "answerStatus": "Correct",
                      "addedAt": "2023-03-13T14:30:27.512Z"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If current user is not inside active pair or user is in active pair but has already answered to all questions"
            }
          },
          "tags": [
            "PairQuizGame"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      }
    },
    "info": {
      "title": "Blogs API",
      "description": "I haven`t made up the description yet ;(",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "schemas": {
        "AuthCredentialsModel": {
          "type": "object",
          "properties": {
            "loginOrEmail": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          },
          "required": [
            "loginOrEmail",
            "password"
          ]
        },
        "ConfirmationCodeModel": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string",
              "description": "Confirmation code",
              "example": "someUUIDdsajkdsa-dsad-as-das-ddsa",
              "format": "email"
            }
          },
          "required": [
            "code"
          ]
        },
        "CreateUserModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "description": "User email",
              "example": "user@example.com",
              "format": "email"
            },
            "login": {
              "type": "string",
              "description": "User name",
              "example": "John",
              "minLength": 3,
              "maxLength": 10
            },
            "password": {
              "type": "string",
              "description": "User password",
              "example": "string",
              "minLength": 6,
              "maxLength": 20
            }
          },
          "required": [
            "email",
            "login",
            "password"
          ]
        },
        "EmailResendModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "description": "User email",
              "example": "user@example.com",
              "format": "email"
            }
          },
          "required": [
            "email"
          ]
        },
        "LikeModel": {
          "type": "object",
          "properties": {
            "likeStatus": {
              "type": "string",
              "description": "Send None if you want to unlike\\undislike",
              "enum": [
                "Like",
                "Dislike",
                "None"
              ]
            }
          },
          "required": [
            "likeStatus"
          ]
        },
        "CreateCommentModel": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string",
              "minLength": 20,
              "maxLength": 300
            }
          },
          "required": [
            "content"
          ]
        },
        "UpdateCommentModel": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string",
              "description": "Data for updating",
              "minLength": 20,
              "maxLength": 300
            }
          },
          "required": [
            "content"
          ]
        },
        "UpdateBlogModel": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 15
            },
            "description": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 500
            },
            "websiteUrl": {
              "type": "string",
              "example": "https://github.com",
              "minLength": 1,
              "maxLength": 100
            }
          },
          "required": [
            "name",
            "description",
            "websiteUrl"
          ]
        },
        "CreateBlogModel": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 15
            },
            "description": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 500
            },
            "websiteUrl": {
              "type": "string",
              "example": "https://github.com",
              "minLength": 1,
              "maxLength": 100
            }
          },
          "required": [
            "name",
            "description",
            "websiteUrl"
          ]
        },
        "CreatePostModel": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 30
            },
            "shortDescription": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 100
            },
            "content": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 1000
            }
          },
          "required": [
            "title",
            "shortDescription",
            "content"
          ]
        },
        "UpdatePostModel": {
          "type": "object",
          "properties": {
            "title": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 30
            },
            "shortDescription": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 100
            },
            "content": {
              "type": "string",
              "example": "string",
              "minLength": 1,
              "maxLength": 1000
            }
          },
          "required": [
            "title",
            "shortDescription",
            "content"
          ]
        },
        "BanUserForBlogModel": {
          "type": "object",
          "properties": {
            "isBanned": {
              "type": "boolean",
              "example": true,
              "description": "true - for ban user, false - for unban user"
            },
            "banReason": {
              "type": "string",
              "example": "stringstringstringst",
              "description": "The reason why user was banned",
              "minLength": 20
            },
            "blogId": {
              "type": "string",
              "example": "string",
              "description": "User will be banned/unbanned for this blog"
            }
          },
          "required": [
            "isBanned",
            "banReason",
            "blogId"
          ]
        },
        "BanBlogInputModel": {
          "type": "object",
          "properties": {}
        },
        "CreateQuizQuestionModel": {
          "type": "object",
          "properties": {}
        },
        "UpdateQuizQuestionModel": {
          "type": "object",
          "properties": {}
        },
        "PublishQuestionModel": {
          "type": "object",
          "properties": {}
        },
        "BanUserModel": {
          "type": "object",
          "properties": {}
        },
        "AnswerInputModel": {
          "type": "object",
          "properties": {
            "answer": {
              "type": "string",
              "example": "string"
            }
          },
          "required": [
            "answer"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
