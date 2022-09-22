import { Controller, Body,  Get, Query, Post, Put, Delete, Req ,UploadedFile, UseInterceptors, Param, HttpException, HttpStatus } from '@nestjs/common';
import { AdminService } from '../../services/admin/admin.service';
import { AlertDocument } from '../../schemas/alert.schema';
import { user } from '../../models/general/user';


@Controller('admin')
export class ApiAdminController {
    constructor(private readonly adminService:AdminService){}    
    
}
