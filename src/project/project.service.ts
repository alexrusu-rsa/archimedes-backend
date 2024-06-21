import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { Rate } from 'src/entity/rate.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class ProjectService {
  constructor(
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    @Inject('RATE_REPOSITORY')
    private rateRepository: Repository<Rate>,
    @Inject('CUSTOMER_REPOSITORY')
    private customerRepository: Repository<Customer>,
  ) {}

  projectsToReturn: Project[] = [];
  async getProjects(): Promise<Project[]> {
    try {
      const projects = await this.projectRepository.find();
      const projectsWithCustomer = await Promise.all(
        projects.map(async (project) => {
          const customer = await this.customerRepository.findOneBy({
            id: project?.customerId,
          });
          return { ...project, customer };
        }),
      );
      if (projectsWithCustomer) return projectsWithCustomer;
      throw new HttpException(
        'We could not find the projects!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async getProjectById(id: string): Promise<Project> {
    try {
      const project = await this.projectRepository.findOneBy({ id });
      if (project) return project;
      throw new HttpException(
        'We could not find the project with id: ' + id,
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async addProject(project: Project): Promise<Project> {
    try {
      const customer = await this.customerRepository.findOneBy({
        id: project.customerId,
      });
      const newProjectId = (await this.projectRepository.insert(project))
        .identifiers[0]?.id;
      if (newProjectId) {
        const projectWithoutCustomer = await this.projectRepository.findOneBy({
          id: newProjectId,
        });
        return { ...projectWithoutCustomer, customer: customer };
      }
      throw new HttpException(
        'Project insertion failed!',
        HttpStatus.NOT_ACCEPTABLE,
      );
    } catch (err) {
      throw err;
    }
  }

  async deleteProject(id: string): Promise<DeleteResult> {
    try {
      const projectToDelete = await this.projectRepository.findOneBy({ id });
      if (projectToDelete) {
        const deletionResult = this.projectRepository.delete(id);
        if (deletionResult) {
          return deletionResult;
        }
        throw new HttpException(
          'Project was not deleted!',
          HttpStatus.BAD_REQUEST,
        );
      }
      throw new HttpException(
        'Project could not be found!',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }

  async updateProjectById(id: string, project: Project): Promise<Project> {
    try {
      const customer = await this.customerRepository.findOneBy({
        id: project.customerId,
      });
      const toUpdateProject = await this.projectRepository.findOneBy({ id });
      if (toUpdateProject) {
        const updatedProject = await this.projectRepository.update(id, project);
        if (updatedProject) {
          const projectWithoutCustomer = await this.projectRepository.findOneBy(
            {
              id,
            },
          );
          return { ...projectWithoutCustomer, customer: customer };
        }
        throw new HttpException(
          'We could not update the project!',
          HttpStatus.BAD_REQUEST,
        );
      } else {
        throw new HttpException(
          'The project you tried to update could not be found!',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      throw err;
    }
  }

  async getProjectsUser(userId: string): Promise<Project[]> {
    try {
      const foundRatesForUser = await this.rateRepository.findBy({
        employeeId: userId,
      });
      if (foundRatesForUser) {
        (await foundRatesForUser).forEach(async (rate: Rate) => {
          const foundProjectOfRate = await this.projectRepository.findOneBy({
            id: rate.projectId,
          });
          this.projectsToReturn.push(foundProjectOfRate);
        });
        const projects = this.projectsToReturn;
        this.projectsToReturn = [];
        return projects;
      }
      throw new HttpException(
        'We could not find any rates for this user.',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
}
