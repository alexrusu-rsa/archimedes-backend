import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { Project } from 'src/entity/project.entity';
import { ProjectService } from './project.service';

@Controller()
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.Admin)
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
  deleteProject(@Param() projectId: string) {
    return this.projectService.deleteProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @Roles(Role.Admin)
  updateProject(@Param() projectToUpdateId: string, @Body() project: Project) {
    return this.projectService.updateProjectById(projectToUpdateId, project);
  }
}
