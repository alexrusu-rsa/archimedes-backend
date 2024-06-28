import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { Project } from 'src/entity/project.entity';
import { ProjectService } from './project.service';
import { Request } from 'express';

@Controller()
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/user')
  getAllProjectsUser(@Req() request: Request) {
    const user = request.user as { userId: string; username: string };
    return this.projectService.getProjectsMe(user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getAllProjects() {
    return this.projectService.getProjects();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Admin)
  addProject(@Body() project: Project) {
    return this.projectService.addProject(project);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(Role.Admin)
  deleteProject(@Param('id') projectId: string) {
    return this.projectService.deleteProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @Roles(Role.Admin)
  updateProject(
    @Param('id') projectToUpdateId: string,
    @Body() project: Project,
  ) {
    return this.projectService.updateProjectById(projectToUpdateId, project);
  }
}
