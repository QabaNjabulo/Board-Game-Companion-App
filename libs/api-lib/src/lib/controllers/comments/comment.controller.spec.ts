import { Test, TestingModule } from "@nestjs/testing";
import { user } from '../../models/general/user';
import { CommentService } from '../../services/comments/comment.service';
import { ApiCommentController } from "../comments/comment.controller";
import { version } from "../../models/general/version";
import { Like, LikeDocument } from '../../schemas/like.schema';

jest.mock('../../services/comments/comment.service');
/***************************************************Unit Test***********************************************/
describe('ApiCommentController', ()=>{
  let controller : ApiCommentController;
  let service : CommentService; 

  beforeEach(async () => {
    const moduleRef : TestingModule = await Test.createTestingModule({
      controllers: [ApiCommentController], 
      providers:[{
        provide:CommentService, useValue:{
          createComment: jest.fn().mockImplementation((user:user,image:string,script:string,content:string)=>
            Promise.resolve({
              user: user,
              image: image, 
              created: new Date("13-02-18"), 
              script: script, 
              content: content, 
              replies: [],
            }),
          ),
          
          countComments: jest.fn().mockImplementation((id:string)=>
          Promise.resolve(5)),
          getComments: jest.fn().mockImplementation((arr:string[]) =>
            Promise.resolve([
              {
                _id:arr[0],
                user:{name:"user1", email:"user1@gmail.com"},
                image:"board1.png",
                created: new Date("30-05-20"),
                script: "Board1Script",
                content: "This is board game 1 comment",
                replies: []
              },
              {
                _id:arr[1],
                user:{name:"user1", email:"user1@gmail.com"},
                image:"board2.png",
                created: new Date("10-08-20"),
                script: "Board2Script",
                content: "This is board game 2 comment",
                replies: []
              },
              {
                _id:arr[2],
                user:{name:"user1", email:"user1@gmail.com"},
                image:"board3.png",
                created: new Date("15-01-21"),
                script: "Board3Script",
                content: "This is board game 3 comment",
                replies: []
              }
            ]),
          ),
          addReply: jest.fn().mockImplementation((commentId:string,replyId:string) =>
            Promise.resolve({
              user: {new:commentId, email:"cocochanel@gmail.com"},
              image: "boardgame33.png",
              created: new Date("17-06-18"),
              script: "boardgame33Script",
              content: "Wow this is so cool", 
              replies: [{replyId, ref:'Comment'}]
            }),
          ),
          like: jest.fn().mockImplementation((comment:string,user:user,like:boolean) =>{
             Promise.resolve({
              comment: comment, 
              user:user,
              like: true,
            });

          }),
          getLike: jest.fn().mockImplementation((comment:string,user:user) => {
            Promise.resolve({
              comment: comment,
              user: user,
              like: true 
            });
          }),
         
          count: jest.fn().mockImplementation((comment:string)=>{
            Promise.resolve({
              likes: 7,
              dislikes: 1,
              replies: 3
            });
          })
        }}
      ]
    }).compile();

    service = moduleRef.get<CommentService>(CommentService);
    controller = moduleRef.get<ApiCommentController>(ApiCommentController);
  });

  it('should be defined', ()=>{
    expect(ApiCommentController).toBeDefined();
  });

  describe('createComment', ()=>{
    it('should create a comment', ()=>{
      controller.createComment("Jack","Jack&Jill@gmail.com", "gameboard.png", "Script4","I love this game").then(function(response){
        const newUser: user={
          name: "Jack",
          email:"Jack&Jill@gmail.com"
        };
        expect(response.toString()).toStrictEqual((
        {
          user: newUser,
          image: "gameboard.png", 
          created: new Date("13-02-18"),
          script: "Script4", 
          content: "I love this game", 
          replies: []
        }).toString())
      })
    });
  });

  describe('countComments', ()=>{
    it('should count the total number of comments', ()=>{
      expect(controller.countComments("Game3")).resolves.toEqual(5)
    });
  });

  describe('getComments', ()=>{
    it('should get all comments of script', ()=>{
      controller.getComments(JSON.stringify("comment15")).then(function(response){
      expect(response.toString()).toStrictEqual(([
        {
          _id: "comment15",
          user:{name:"user1", email:"user1@gmail.com"},
          image:"board1.png",
          created: new Date("30-05-20"),
          script: "Board1Script",
          content: "This is board game 1 comment",
          replies: []
        },
        {
          _id: "comment15",
          user:{name:"user1", email:"user1@gmail.com"},
          image:"board2.png",
          created: new Date("10-08-20"),
          script: "Board2Script",
          content: "This is board game 2 comment",
          replies: []
        },
        {
          _id: "comment15",
          user:{name:"user1", email:"user1@gmail.com"},
          image:"board3.png",
          created: new Date("15-01-21"),
          script: "Board3Script",
          content: "This is board game 3 comment",
          replies: []
        }
      ]).toString())
    })
    });
  });
  

  describe('addReply', ()=>{
    it('should add a reply to a comment', ()=>{
      expect(controller.addReply("comment1818", "reply1818")).toBeDefined();
    });
  });
  // describe('likeComment', ()=>{
  //   it('should like a comment',()=>{
  //     const thisUser : user ={   /*Not implemented*/
  //       name:"Angie",
  //       email:"AngieGovender@gmail.com"
  //     }
      
  //     controller.likeComment("This is my comment",thisUser,true).then(function(response){
  //       expect(response.toString()).resolves.toStrictEqual(({
  //         comment:"This is my comment", 
  //         user: thisUser,
  //         like: true,
  //     }).toString());
  //     });
  //   });
  // });

  // describe('countLikes', ()=>{
  //   it('should display number of likes', ()=>{
  //     controller.countLikes("This is a comment").then(function(response){      
  //       expect(response.toString()).resolves.toStrictEqual(({
  //       likes: 7,
  //       dislikes: 1,
  //       replies: 3
  //     }).toString())
  //   });
  //   });
  // });


  // describe('getLike', ()=>{
  //   it('should get likes of user', ()=>{
  //     const newUser: user ={
  //       name: "Jade",
  //       email: "JadeJacobs@gmail.com"
  //     }
  //     controller.getLike("Thiscomment",newUser.name, newUser.email).then(function(response){
  //     expect(response).resolves.toStrictEqual(({
  //       comment: "Thiscomment",
  //       user: newUser,
  //       like:true
  //     }));
  //   });
  //   });
  // });

});