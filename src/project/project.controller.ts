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
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

@ApiTags('Project')
@Controller()
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':userId')
  @ApiOperation({
    summary: 'Get all projects of a user',
    description:
      'Fetch the projects of the user identified by the unique ID given as request parameter',
  })
  @ApiParam({
    name: 'userId',
    description: 'Unique ID of the user we want to check the projects of.',
  })
  getAllProjectsUser(@Param('userId') userId: string) {
    return this.projectService.getProjectsUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all projects',
    description: 'Fetch all existing projects.',
  })
  getAllProjects() {
    return this.projectService.getProjects();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Add a new project',
    description: 'Adds the project given in the request body.',
  })
  @ApiBody({ type: Project, description: 'The project we want to add.' })
  addProject(@Body() project: Project) {
    return this.projectService.addProject(project);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Delete a project',
    description:
      'Delete the project identified by the unique ID given as request parameter.',
  })
  @ApiParam({
    name: 'projectId',
    description: 'Unique ID of the project we want to delete',
  })
  deleteProject(@Param('id') projectId: string) {
    return this.projectService.deleteProject(projectId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @Roles(Role.Admin)
  @ApiOperation({
    summary: 'Update project data',
    description:
      'Updates the project identified by the unique ID given as request parameter with the data given in the request body.',
  })
  @ApiBody({
    type: Project,
    description: 'The updated project data.',
  })
  @ApiParam({
    name: 'projectToUpdateId',
    description: 'Unique ID of the project we want to update.',
  })
  updateProject(
    @Param('id') projectToUpdateId: string,
    @Body() project: Project,
  ) {
    return this.projectService.updateProjectById(projectToUpdateId, project);
  }
}
